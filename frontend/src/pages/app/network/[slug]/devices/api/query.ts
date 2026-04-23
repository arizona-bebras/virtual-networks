import { queryOptions } from "@tanstack/svelte-query";

import { client } from "$shared/api/openapi-client";

export const deviceQuery = {
  userDevices: (networkId: string) =>
    queryOptions({
      queryKey: ["userDevices"],
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
