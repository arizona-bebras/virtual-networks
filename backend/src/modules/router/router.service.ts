import { Inject, Injectable } from "@nestjs/common";
import { Address4 } from "ip-address";
import {
  ChangedResource,
  ConfigurationUpdateReason,
  type ProtocolInstanceConfig,
  type RouterConfiguration,
  type RouterConfigurationUpdate,
} from "proto";
import { concatWith, defer, from, map, Observable, Subject } from "rxjs";
import { type Database, DRIZZLE } from "../../db/database.module.js";

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
        mtu: 1280,
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
}
