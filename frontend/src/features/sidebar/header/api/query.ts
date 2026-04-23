import {
  mutationOptions,
  type QueryClient,
} from "@tanstack/svelte-query";
import type { CreateNetwork } from "common/schemas/network/create-network";
import { client } from "$shared/api/openapi-client";

export const headerQueries = {
  createNetworkMutation: (queryClient: QueryClient) =>
    mutationOptions({
      mutationFn: async (newNetwork: CreateNetwork) => {
        const { data, error } = await client.POST("/networks", {
          body: newNetwork,
        });
        if (error) throw error;
        return data;
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["userNetworks"] });
      },
    }),
};
