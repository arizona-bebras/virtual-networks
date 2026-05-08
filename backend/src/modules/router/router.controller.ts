import { Metadata } from "@grpc/grpc-js";
import { Controller } from "@nestjs/common";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import {
  ChangedResourceType,
  ChangeOperation,
  ConfigurationUpdateReason,
  type PeerConfig,
  type ReportRouterEventsResponse,
  type RouterConfiguration,
  type RouterConfigurationUpdate,
  RouterControlPlaneController,
  RouterControlPlaneControllerMethods,
  type RouterEvent,
  type WatchRouterConfigurationRequest,
} from "proto";
import { from, Observable } from "rxjs";
import { RouterService } from "./router.service";

// Константы, дублирующие Python mock сервер
const REVISION = "mock-static-1";
const KEYS = {
  "server-primary": [
    "YM0F8jQ+Qrc+2mNWUw3HeaH4hTVUbP78I3bBE/kekUg=",
    "wrLQuFIunLmQbDc3AFin1X/7vKHKGpbKa9Nc7M4svXY=",
  ],
  "server-secondary": [
    "8HDJUD7WxZm66XK/ccWWW4ZfWCi1N6IAyVfdjWWAA3o=",
    "RLfHKd8iJ0YfuwTHcYf+fltnY5nG09jzffxXbKoHJGE=",
  ],
  "primary-peer-1": [
    "wILL9118d3g4QhT0brK0Qrm66iSy13haHqfvlkaj6lY=",
    "xmvO+JJP8g8Uw7Jvq6IG1E8CN/AG6L9mLyJtu7nH43o=",
  ],
  "primary-peer-2": [
    "EPQ5fk29T/ZzRUSKTaGcCEQhYsw+qLYAznufp2ReCEo=",
    "Lukx7dxexJ1z2esHjuMqDNAofw+izuj521L8BzOE9UI=",
  ],
  "secondary-peer-1": [
    "YHSVM98rNY4nTSlYoT+WJf45DqGXt7fa13ZF0Z0n83Q=",
    "G/7SyavBaDZ0+x8hkY9sZpIugv7ClwG57YAT7wq/SFA=",
  ],
  "secondary-peer-2": [
    "8NZzN116A1UOn+dmNX9qpJBsxxq0KfUJohnK+LK452U=",
    "b8TjRRaNSAcF/tyWE/rKu3T7SLtJU2IBsIiDPMHQl1o=",
  ],
};

const privateKey = (name: keyof typeof KEYS): Uint8Array => {
  return Buffer.from(KEYS[name][0], "base64");
};

const publicKey = (name: keyof typeof KEYS): Uint8Array => {
  return Buffer.from(KEYS[name][1], "base64");
};

const createPeerConfig = (
  peerId: keyof typeof KEYS,
  networkId: string,
  address: string,
): PeerConfig => {
  return {
    id: peerId,
    networkId: networkId,
    address: address,
    allowedIps: [`${address}/32`],
    wireguard: {
      publicKey: publicKey(peerId),
    },
  };
};

const createStaticConfiguration = (): RouterConfiguration => {
  return {
    revision: REVISION,
    networks: [
      {
        id: "primary",
        name: "primary",
        cidr: "10.44.0.0/24",
        serverAddress: "10.44.0.1",
        mtu: 1420,
        statusPort: 8080,
        peers: [
          createPeerConfig("primary-peer-1", "primary", "10.44.0.2"),
          createPeerConfig("primary-peer-2", "primary", "10.44.0.3"),
        ],
      },
      {
        id: "secondary",
        name: "secondary",
        cidr: "10.44.0.0/24",
        serverAddress: "10.44.0.1",
        mtu: 1420,
        statusPort: 8080,
        peers: [
          createPeerConfig("secondary-peer-1", "secondary", "10.44.0.2"),
          createPeerConfig("secondary-peer-2", "secondary", "10.44.0.3"),
        ],
      },
    ],
    protocols: [
      {
        id: "wg-primary",
        name: "wireguard",
        networkId: "primary",
        listenPort: 51820,
        publicHost: "127.0.0.1",
        peerIds: ["primary-peer-1", "primary-peer-2"],
        wireguard: {
          interfacePrivateKey: privateKey("server-primary"),
          interfacePublicKey: publicKey("server-primary"),
          persistentKeepaliveSeconds: 25,
        },
      },
      {
        id: "wg-secondary",
        name: "wireguard",
        networkId: "secondary",
        listenPort: 51820,
        publicHost: "127.0.0.1",
        peerIds: ["secondary-peer-1", "secondary-peer-2"],
        wireguard: {
          interfacePrivateKey: privateKey("server-secondary"),
          interfacePublicKey: publicKey("server-secondary"),
          persistentKeepaliveSeconds: 25,
        },
      },
    ],
  };
};

@Controller()
@RouterControlPlaneControllerMethods()
export class RouterController implements RouterControlPlaneController {
  constructor(private readonly routerService: RouterService) {}

  watchRouterConfiguration(
    request: WatchRouterConfigurationRequest,
    metadata: Metadata,
  ): Observable<RouterConfigurationUpdate> {
    const configuration = createStaticConfiguration();
    const update: RouterConfigurationUpdate = {
      revision: REVISION,
      reason:
        ConfigurationUpdateReason.CONFIGURATION_UPDATE_REASON_INITIAL_SNAPSHOT,
      configuration: configuration,
      changedResources: [
        {
          type: ChangedResourceType.CHANGED_RESOURCE_TYPE_NETWORK,
          id: "000000000",
          networkId: "primary",
          operation: ChangeOperation.CHANGE_OPERATION_CREATED,
        },
      ],
    };
    return from([update]);
  }

  reportRouterEvents(
    event: Observable<RouterEvent>,
    metadata: Metadata,
  ):
    | Promise<ReportRouterEventsResponse>
    | Observable<ReportRouterEventsResponse>
    | ReportRouterEventsResponse {
    return {
      acceptedEvents: 0,
    };
  }
}
