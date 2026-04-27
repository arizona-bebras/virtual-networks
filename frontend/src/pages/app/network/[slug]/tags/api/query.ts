import { queryOptions } from "@tanstack/svelte-query";

import { client } from "$shared/api/openapi-client";

export const userTagsFn = async (networkId: string) => {
  const { data, error } = await client.GET("/networks/{network_id}/tags", {
    params: {
      path: {
        network_id: networkId,
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
  userTags: (networkId: string) =>
    queryOptions({
      queryKey: ["userTags", networkId],
      queryFn: () => userTagsFn(networkId),
    }),
};
