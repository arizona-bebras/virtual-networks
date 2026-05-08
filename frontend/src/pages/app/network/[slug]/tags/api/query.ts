import { queryOptions } from "@tanstack/svelte-query";

import { client } from "$shared/api/openapi-client";

export const deviceTags = {
  userTags: (networkId: string, q?: string) =>
    queryOptions({
      queryKey: ["userTags", networkId, q],
      queryFn: async () => {
        const { data, error } = await client.GET(
          "/networks/{network_id}/tags",
          {
            params: {
              path: {
                network_id: networkId,
              },
              query: {
                q: q,
              },
            },
          },
        );
        if (error) throw error;
        return data;
      },
    }),
};
