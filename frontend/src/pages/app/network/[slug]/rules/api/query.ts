import { queryOptions } from "@tanstack/svelte-query";

import { client } from "$shared/api/openapi-client";

export const deviceQuery = {
  userDevices: (networkId: string) =>
    queryOptions({
      queryKey: ["userDevices", networkId],
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

        // TODO: удалить после реализации стастуса на бэке
        return data!.map((device) => ({
          ...device,
          status: "online" as const,
        }));
      },
    }),
};

export const userRules = (networkId: string) =>
  queryOptions({
    queryKey: ["userRules", networkId],
    queryFn: async () => {
      const { data, error } = await client.GET("/networks/{network_id}/rules", {
        params: {
          path: {
            network_id: networkId,
          },
        },
      });
      if (error) throw error;
      return data;
    },
  });
