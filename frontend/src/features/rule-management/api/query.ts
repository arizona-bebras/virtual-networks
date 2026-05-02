import { mutationOptions } from "@tanstack/svelte-query";
import type { CreateRule } from "common/schemas/rule/create-rule";
import type { UpdateRule } from "common/schemas/rule/update-rule";
import { client } from "$shared/api/openapi-client";

export const ruleCreationMutation = (onSuccess: () => void) =>
  mutationOptions({
    mutationFn: async ({
      networkId,
      ruleInfo,
    }: {
      networkId: string;
      ruleInfo: CreateRule;
    }) => {
      const { data, error } = await client.POST(
        "/networks/{network_id}/rules",
        {
          params: {
            path: {
              network_id: networkId,
            },
          },
          body: ruleInfo,
        },
      );
      if (error) throw error;
      return data;
    },
    onSuccess,
  });

export const ruleDeletionMutation = (onSuccess: () => void) =>
  mutationOptions({
    mutationFn: async ({
      networkId,
      ruleId,
    }: {
      networkId: string;
      ruleId: string;
    }) => {
      const { error } = await client.DELETE(
        "/networks/{network_id}/rules/{rule_id}",
        {
          params: {
            path: {
              network_id: networkId,
              rule_id: ruleId,
            },
          },
        },
      );
      if (error) throw error;
    },
    onSuccess,
  });

export const ruleUpdateMutation = (onSuccess: () => void) =>
  mutationOptions({
    mutationFn: async ({
      networkId,
      ruleId,
      ruleInfo,
    }: {
      networkId: string;
      ruleId: string;
      ruleInfo: UpdateRule;
    }) => {
      const { error } = await client.PUT(
        "/networks/{network_id}/rules/{rule_id}",
        {
          params: {
            path: {
              network_id: networkId,
              rule_id: ruleId,
            },
          },
          body: ruleInfo,
        },
      );
      if (error) throw error;
    },
    onSuccess,
  });
