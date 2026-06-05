import { Inject, Injectable } from "@nestjs/common";
import { Address4 } from "ip-address";
import {
  ChangedResource,
  ConfigurationUpdateReason,
  PeerConnectionState,
  type ProtocolInstanceConfig,
  type RouterConfiguration,
  type RouterConfigurationUpdate,
  type RouterEvent,
  TrafficProtocol,
} from "proto";
import { concatWith, defer, from, map, Observable, Subject } from "rxjs";
import { type Database, DRIZZLE } from "../../db/database.module.js";
import * as schema from "../../db/schema.js";

@Injectable()
export class RouterService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}
  private readonly events = new Subject<RouterConfigurationUpdate>();

  private async buildRouterConfiguration(): Promise<RouterConfiguration> {
    const networks = await this.db.query.networks.findMany({
      columns: {
        id: true,
        name: true,
        cidr: true,
        domain: true,
      },
      with: {
        devices: {
          columns: {
            id: true,
            networkId: true,
            ip: true,
            slug: true,
          },
          with: {
            keys: {
              columns: {
                publicKey: true,
              },
            },
          },
        },
        rules: {
          columns: {
            id: true,
            port: true,
            protocol: true,
            sourceId: true,
            destId: true,
          },
          with: {
            source: {
              columns: {},
              with: {
                devices: {
                  columns: {
                    id: true,
                  },
                },
              },
            },
            dest: {
              columns: {},
              with: {
                devices: {
                  columns: {
                    id: true,
                  },
                },
              },
            },
          },
        },
        keys: {
          columns: {
            publicKey: true,
            privateKey: true,
          },
        },
      },
    });

    const networkConfigs = networks.map((network) => {
      return {
        id: network.id,
        name: network.name,
        domain: network.domain,
        cidr: network.cidr,
        serverAddress: new Address4(network.cidr)
          .startAddressExclusive()
          .correctForm(),
        mtu: 1420,
        statusPort: 8080,
        peers: network.devices.map((device) => {
          return {
            id: device.id,
            networkId: device.networkId,
            address: device.ip,
            allowedIps: ["0.0.0.0/0"],
            domain: device.slug,
            wireguard: {
              publicKey: device.keys?.publicKey ?? new Uint8Array([]),
            },
          };
        }),
        rules: network.rules.map((rule) => {
          return {
            id: rule.id,
            source: {
              all: rule.sourceId === null,
              peerIds: rule.source?.devices.map((device) => device.id) ?? [],
            },
            destination: {
              all: rule.destId === null,
              peerIds: rule.dest?.devices.map((device) => device.id) ?? [],
            },
            protocol: trafficProtocolFromRule(rule.protocol),
            port: rule.port ?? undefined,
          };
        }),
      };
    });

    const protocols: ProtocolInstanceConfig[] = [];

    for (let i = 0; i < networks.length; i++) {
      protocols.push({
        id: `wg-${networks[i].id}`,
        name: "wireguard",
        networkId: networks[i].id,
        listenPort: 51820,
        publicHost: process.env.ROUTER_ADDRESS ?? "",
        peerIds: [],
        wireguard: {
          interfacePrivateKey:
            networks[i].keys?.privateKey ?? new Uint8Array([]),
          interfacePublicKey: networks[i].keys?.publicKey ?? new Uint8Array([]),
          persistentKeepaliveSeconds: 60 * 60 * 24,
        },
      });
    }

    return {
      revision: String(Date.now()),
      networks: networkConfigs,
      protocols: protocols,
    };
  }

  async emitEvent(
    reason: ConfigurationUpdateReason,
    changes: ChangedResource[],
  ) {
    this.events.next({
      revision: String(Date.now()),
      reason: reason,
      configuration: await this.buildRouterConfiguration(),
      changedResources: changes,
    });
  }

  getEventsObservableStream(): Observable<RouterConfigurationUpdate> {
    return defer(() => from(this.buildRouterConfiguration())).pipe(
      map((configuration) => {
        return {
          revision: String(Date.now()),
          reason:
            ConfigurationUpdateReason.CONFIGURATION_UPDATE_REASON_INITIAL_SNAPSHOT,
          configuration: configuration,
          changedResources: [],
        };
      }),
      concatWith(this.events.asObservable()),
    );
  }

  async writeRouterEvent(event: RouterEvent) {
    const peerData = event.wireguardConnection;

    if (!peerData) {
      return;
    }

    const lastHandshakeTime = peerData.latestHandshakeAt
      ? new Date(peerData.latestHandshakeAt.seconds * 1000)
      : undefined;

    const payload = {
      isOnline:
        peerData.state === PeerConnectionState.PEER_CONNECTION_STATE_CONNECTED,
      lastHandshakeTime,
      bytesReceived: BigInt(peerData.rxBytes),
      bytesSent: BigInt(peerData.txBytes),
    };

    await this.db
      .insert(schema.peerStates)
      .values({
        ...payload,
        deviceId: peerData.peerId,
        networkId: peerData.networkId,
      })
      .onConflictDoUpdate({
        target: schema.peerStates.deviceId,
        set: payload,
      });
  }
}

const trafficProtocolFromRule = (
  protocol: "TCP" | "UDP" | "ICMP" | null,
): TrafficProtocol => {
  switch (protocol) {
    case "TCP":
      return TrafficProtocol.TRAFFIC_PROTOCOL_TCP;
    case "UDP":
      return TrafficProtocol.TRAFFIC_PROTOCOL_UDP;
    case "ICMP":
      return TrafficProtocol.TRAFFIC_PROTOCOL_ICMP;
    default:
      return TrafficProtocol.TRAFFIC_PROTOCOL_UNSPECIFIED;
  }
};
