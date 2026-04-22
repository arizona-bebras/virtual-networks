import { mutationOptions } from "@tanstack/svelte-query";
import { client } from "$shared/api/openapi-client";
import type { deviceCreationBody } from "$shared/api/openapi-types";

export const deviceСreationQuery = () =>
  mutationOptions({
    mutationFn: async ({
      networkId,
      deviceInfo,
    }: {
      networkId: string;
      deviceInfo: deviceCreationBody;
    }) => {
      const { data, error } = await client.POST(
        "/networks/{network_id}/devices",
        {
          params: {
            path: {
              network_id: networkId,
            },
          },
          body: deviceInfo,
        },
      );
      if (error) throw error;
      return data;
    },
  });
