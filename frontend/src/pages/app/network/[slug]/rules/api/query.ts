import { queryOptions } from "@tanstack/svelte-query";

import { client } from "$shared/api/openapi-client";
import { queryKeys } from "$shared/api/query-keys";

export const deviceQuery = {
  userDevices: (networkId: string) =>
    queryOptions({
      queryKey: queryKeys.networkDevicesList(networkId),
      queryFn: async () => {
        const { data, error } = await client.GET(
          "/networks/{network_id}/devices",
          {
            params: {
              path: {
                network_id: networkId,
              },
            },
          },
        );
        if (error) throw error;
        return data;
      },
    }),
};

export const userRules = (
  networkId: string,
  q?: string,
  sourceTags?: string[],
  destTags?: string[],
) =>
  queryOptions({
    queryKey: queryKeys.networkRulesList(networkId, {
      q,
      sourceTags,
      destTags,
    }),
    queryFn: async () => {
      const { data, error } = await client.GET("/networks/{network_id}/rules", {
        params: {
          path: {
            network_id: networkId,
          },
          query: {
            q,
            source_tags: sourceTags,
            dest_tags: destTags,
          },
        },
      });
      if (error) throw error;
      return data;
    },
  });
