import type { DeviceRelations } from "common/schemas/device/index";
import type { TagColor } from "common/schemas/tag/index";

export type DeviceNodeData = {
  id: string;
  name: string;
  ip: string;
  device: DeviceRelations;
};

export type TagNodeData = {
  label: string;
  id: string;
  name: string;
  color: TagColor | "gray";
  count: number;
};

export type RuleNodeData = {
  name: string;
  protocol: string;
  port: string;
  action: string;
  sourceId: string | null;
  destId: string | null;
};
