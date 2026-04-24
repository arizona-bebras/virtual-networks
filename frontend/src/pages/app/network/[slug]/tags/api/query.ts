import { queryOptions } from "@tanstack/svelte-query";

import { client } from "$shared/api/openapi-client";

export const deviceTags = {
  userTags: (networkId: string) =>
    queryOptions({
      queryKey: ["userTags", networkId],
      queryFn: async () => {
        const { data, error } = await client.GET(
          "/networks/{network_id}/tags",
          {
            params: {
              path: {
                network_id: networkId,
              },
            },
          },
        );
        if (error) throw error;

        // Добавляем временный статус и маппим ownerId в owner
        return data.map((tag) => ({
          ...tag,
          count: Math.floor(Math.random() * 100), // Временное значение для количества устройств с этим тегом
        }));
      },
    }),
};
