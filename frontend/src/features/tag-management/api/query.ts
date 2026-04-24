import { mutationOptions } from "@tanstack/svelte-query";
import type { CreateTag } from "common/schemas/tag/create-tag";
import type { UpdateTag } from "common/schemas/tag/update-tag";
import { client } from "$shared/api/openapi-client";

export const tagCreationMutation = (onSuccess: () => void) =>
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
    onSuccess,
  });

export const tagDeletionMutation = (onSuccess: () => void) =>
  mutationOptions({
    mutationFn: async ({
      networkId,
      tagId,
    }: {
      networkId: string;
      tagId: string;
    }) => {
      const { error } = await client.DELETE(
        "/networks/{network_id}/tags/{tag_id}",
        {
          params: {
            path: {
              network_id: networkId,
              tag_id: tagId,
            },
          },
        },
      );
      if (error) throw error;
    },
    onSuccess,
  });

export const tagUpdateMutation = (onSuccess: () => void) =>
  mutationOptions({
    mutationFn: async ({
      networkId,
      tagId,
      tagInfo,
    }: {
      networkId: string;
      tagId: string;
      tagInfo: UpdateTag;
    }) => {
      const { error } = await client.PUT(
        "/networks/{network_id}/tags/{tag_id}",
        {
          params: {
            path: {
              network_id: networkId,
              tag_id: tagId,
            },
          },
          body: tagInfo,
        },
      );
      if (error) throw error;
    },
    onSuccess,
  });
