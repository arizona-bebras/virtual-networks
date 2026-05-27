import { queryOptions } from "@tanstack/svelte-query";
import { client } from "$shared/api/openapi-client";
import { queryKeys } from "$shared/api/query-keys";

export const sidebarQuerys = {
  networkDetails: (networkId: string) =>
    queryOptions({
      queryKey: queryKeys.network(networkId),
      queryFn: async () => {
        const { data, error } = await client.GET("/networks/{network_id}", {
          params: {
            path: {
              network_id: networkId,
            },
          },
        });
        if (error) throw error;
        return data;
      },
    }),
  userNetworks: () =>
    queryOptions({
      queryKey: queryKeys.networks(),
      queryFn: async () => {
        const { data, error } = await client.GET("/networks");
        if (error) throw error;
        return data;
      },
    }),
};
