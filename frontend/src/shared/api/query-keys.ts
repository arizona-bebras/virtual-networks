export const queryKeys = {
  networks: () => ["networks"] as const,
  network: (networkId: string) => [...queryKeys.networks(), networkId] as const,
  networkDevices: (networkId: string) =>
    [...queryKeys.network(networkId), "devices"] as const,
  networkDevicesList: (
    networkId: string,
    filters?: {
      q?: string;
      tags?: string[];
      ownerId?: string;
    },
  ) => [...queryKeys.networkDevices(networkId), filters ?? {}] as const,
  networkDevice: (networkId: string, deviceId: string) =>
    [...queryKeys.networkDevices(networkId), deviceId] as const,
  networkDeviceConfig: (networkId: string, deviceId: string) =>
    [...queryKeys.networkDevice(networkId, deviceId), "config"] as const,
  networkDeviceStatus: (networkId: string, deviceId: string) =>
    [...queryKeys.networkDevice(networkId, deviceId), "status"] as const,
  networkDeviceIp: (networkId: string) =>
    [...queryKeys.network(networkId), "device", "ip"] as const,
  networkTags: (networkId: string) =>
    [...queryKeys.network(networkId), "tags"] as const,
  networkTagsList: (networkId: string, filters?: { q?: string }) =>
    [...queryKeys.networkTags(networkId), filters ?? {}] as const,
  networkRules: (networkId: string) =>
    [...queryKeys.network(networkId), "rules"] as const,
  networkRulesList: (
    networkId: string,
    filters?: {
      q?: string;
      sourceTags?: string[];
      destTags?: string[];
    },
  ) => [...queryKeys.networkRules(networkId), filters ?? {}] as const,
  networkUsers: (networkId: string) =>
    [...queryKeys.network(networkId), "users"] as const,
};
