import { queryOptions } from "@tanstack/svelte-query";

import { client } from "$shared/api/openapi-client";
import { queryKeys } from "$shared/api/query-keys";

export const deviceQuery = {
  userDevices: ({
    networkId,
    q,
    tags,
    owner_id,
  }: {
    networkId: string;
    q?: string;
    tags?: string[];
    owner_id?: string;
  }) =>
    queryOptions({
      queryKey: queryKeys.networkDevicesList(networkId, {
        q,
        tags,
        ownerId: owner_id,
      }),
      queryFn: async () => {
        const { data, error } = await client.GET(
          "/networks/{network_id}/devices",
          {
            params: {
              path: {
                network_id: networkId,
              },
              query: {
                q,
                tags,
                owner_id,
              },
            },
          },
        );
        if (error) throw error;
        return data;
      },
    }),
};
export const deviceStatus = (networkId: string, deviceId: string) =>
  queryOptions({
    queryKey: queryKeys.networkDeviceStatus(networkId, deviceId),
    queryFn: async () => {
      const { data, error } = await client.GET(
        "/networks/{network_id}/devices/{device_id}/status",
        {
          params: {
            path: {
              network_id: networkId,
              device_id: deviceId,
            },
          },
        },
      );
      if (error) throw error;
      return data;
    },
    refetchInterval: () => 30000,
  });
