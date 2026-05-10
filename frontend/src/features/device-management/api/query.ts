import { mutationOptions, queryOptions } from "@tanstack/svelte-query";
import type { CreateDevice } from "common/schemas/device/create-device";
import type { DeviceRelations } from "common/schemas/device/index";
import type { UpdateDevice } from "common/schemas/device/update-device";
import { client } from "$shared/api/openapi-client";

export const deviceСreationQuery = (onSuccess: () => void) =>
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
    onSuccess,
  });

export const deviceDeletionMutation = (onSuccess: () => void) =>
  mutationOptions({
    mutationFn: async ({
      networkId,
      deviceId,
    }: {
      networkId: string;
      deviceId: string;
    }) => {
      const { error } = await client.DELETE(
        "/networks/{network_id}/devices/{device_id}",
        {
          params: {
            path: {
              network_id: networkId,
              device_id: deviceId,
            },
          },
        },
      );
      if (error) throw error;
    },
    onSuccess,
  });

export const deviceUpdateMutation = (onSuccess: () => void) =>
  mutationOptions({
    mutationFn: async ({
      networkId,
      deviceId,
      deviceInfo,
    }: {
      networkId: string;
      deviceId: string;
      deviceInfo: UpdateDevice;
    }) => {
      const { error } = await client.PUT(
        "/networks/{network_id}/devices/{device_id}",
        {
          params: {
            path: {
              network_id: networkId,
              device_id: deviceId,
            },
          },
          body: deviceInfo,
        },
      );
      if (error) throw error;
    },
    onSuccess,
  });

export const tagDeviceCreation = (onSuccess: () => void) =>
  mutationOptions({
    mutationFn: async ({
      networkId,
      tagId,
      deviceId,
      deviceInfo,
    }: {
      networkId: string;
      tagId: string;
      deviceId: string;
      deviceInfo: DeviceRelations;
    }) => {
      const { error } = await client.POST(
        "/networks/{network_id}/devices/{device_id}/add_tag/{tag_id}",
        {
          params: {
            path: {
              network_id: networkId,
              tag_id: tagId,
              device_id: deviceId,
            },
          },
          body: deviceInfo,
        },
      );
      if (error) throw error;
    },
    onSuccess,
  });
export const tagDeviceRemove = (onSuccess: () => void) =>
  mutationOptions({
    mutationFn: async ({
      networkId,
      tagId,
      deviceId,
      deviceInfo,
    }: {
      networkId: string;
      tagId: string;
      deviceId: string;
      deviceInfo: DeviceRelations;
    }) => {
      const { error } = await client.DELETE(
        "/networks/{network_id}/devices/{device_id}/add_tag/{tag_id}",
        {
          params: {
            path: {
              network_id: networkId,
              tag_id: tagId,
              device_id: deviceId,
            },
          },
          body: deviceInfo,
        },
      );
      if (error) throw error;
    },
    onSuccess,
  });
export const deviceOwners = (networkId: string) =>
  queryOptions({
    queryKey: ["deviceOwners", networkId],
    queryFn: async () => {
      const { data, error } = await client.GET("/networks/{network_id}/users", {
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