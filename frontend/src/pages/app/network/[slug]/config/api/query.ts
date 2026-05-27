import { mutationOptions, queryOptions } from "@tanstack/svelte-query";
import type { UpdateNetwork } from "common/schemas/network/update-network";
import { client } from "$shared/api/openapi-client";
import { queryKeys } from "$shared/api/query-keys";

export const networkConfig = (networkId: string) =>
  queryOptions({
    queryKey: queryKeys.network(networkId),
    queryFn: async () => {
      const { data, error } = await client.GET("/networks/{network_id}", {
        params: {
          path: {
            network_id: networkId,
          },
        },
      });
      if (error) throw error;
      return data;
    },
  });

export const networkUpdateMutation = (onSuccess: () => void) =>
  mutationOptions({
    mutationFn: async ({
      networkId,
      networkInfo,
    }: {
      networkId: string;
      networkInfo: UpdateNetwork;
    }) => {
      const { data, error } = await client.PUT("/networks/{network_id}", {
        params: {
          path: {
            network_id: networkId,
          },
        },
        body: networkInfo,
      });
      if (error) throw error;
      return data;
    },
    onSuccess,
  });

export const networkDeletionMutation = (onSuccess: () => void) =>
  mutationOptions({
    mutationFn: async (networkId: string) => {
      const { error } = await client.DELETE("/networks/{network_id}", {
        params: {
          path: {
            network_id: networkId,
          },
        },
      });
      if (error) throw error;
    },
    onSuccess,
  });
