import { mutationOptions, queryOptions } from "@tanstack/svelte-query";
import { client } from "$shared/api/openapi-client";
import type { networkCreationBody } from "$shared/api/openapi-types";

export const headerQueries = {

  createNetworkMutation: () =>
    mutationOptions({
      mutationFn: async (newNetwork: networkCreationBody) => {
        const { data, error } = await client.POST("/networks", {
          body: newNetwork,
        });
        if (error) throw error;
        return data;
      },
    }),
};
