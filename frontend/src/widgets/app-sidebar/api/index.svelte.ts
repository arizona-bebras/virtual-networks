import { queryOptions } from "@tanstack/svelte-query";
import { client } from "$shared/api/openapi-client";

export const sidebarQuerys = {
  networkDetails: (networkId: string) =>
    queryOptions({
      queryKey: ["networkDetails", networkId],
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
};
