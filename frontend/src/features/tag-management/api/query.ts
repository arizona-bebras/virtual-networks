import { mutationOptions } from "@tanstack/svelte-query";
import type { CreateTag } from "common/schemas/tag/create-tag";
import { client } from "$shared/api/openapi-client";

export const deviceСreationQuery = () =>
  mutationOptions({
    mutationFn: async ({
      networkId,
      tagInfo,
    }: {
      networkId: string;
      tagInfo: CreateTag;
    }) => {
      const { data, error } = await client.POST("/networks/{network_id}/tags", {
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
