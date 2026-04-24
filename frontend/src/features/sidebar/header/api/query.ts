import { mutationOptions } from "@tanstack/svelte-query";
import type { CreateNetwork } from "common/schemas/network/create-network";
import type { Network } from "common/schemas/network/index";
import { client } from "$shared/api/openapi-client";

export const headerQueries = {
  createNetworkMutation: (onSuccess: (data: Network) => void) =>
    mutationOptions({
      mutationFn: async (newNetwork: CreateNetwork) => {
        const { data, error } = await client.POST("/networks", {
          body: newNetwork,
        });
        if (error) throw error;
        return data;
      },
      onSuccess,
    }),
};
