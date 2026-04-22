import { mutationOptions } from "@tanstack/svelte-query";
import type { CreateDevice } from "common/schemas/device/create-device";
import { client } from "$shared/api/openapi-client";

export const deviceСreationQuery = () =>
  mutationOptions({
    mutationFn: async ({
      networkId,
      deviceInfo,
    }: {
      networkId: string;
      deviceInfo: CreateDevice;
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
