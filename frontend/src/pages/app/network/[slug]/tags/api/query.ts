import { queryOptions } from "@tanstack/svelte-query";

import { client } from "$shared/api/openapi-client";
import { queryKeys } from "$shared/api/query-keys";

export const userTagsFn = async (networkId: string, q?: string) => {
  const { data, error } = await client.GET("/networks/{network_id}/tags", {
    params: {
      path: {
        network_id: networkId,
      },
      query: {
        q: q,
      },
    },
  });
  if (error) throw error;

  return data.map((tag) => ({
    ...tag,
    count: Math.floor(Math.random() * 100),
  }));
};

export const deviceTags = {
  userTags: (networkId: string, q?: string) =>
    queryOptions({
      queryKey: queryKeys.networkTagsList(networkId, { q }),
      queryFn: () => userTagsFn(networkId, q),
    }),
};
