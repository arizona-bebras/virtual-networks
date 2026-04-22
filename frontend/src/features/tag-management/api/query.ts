import { mutationOptions } from "@tanstack/svelte-query";
import { client } from "$shared/api/openapi-client";
import type { tagCreationBody } from "$shared/api/openapi-types";

export const deviceСreationQuery = () =>
  mutationOptions({
    mutationFn: async ({
      networkId,
      tagInfo,
    }: {
      networkId: string;
      tagInfo: tagCreationBody;
    }) => {
      const { data, error } = await client.POST("/network/{network_id}/tags", {
        params: {
          path: {
            network_id: networkId,
          },
        },
        body: tagInfo,
      });
      if (error) throw error;
      return data;
    },
  });
