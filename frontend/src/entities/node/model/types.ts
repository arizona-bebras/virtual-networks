import type { DeviceRelations } from "common/schemas/device/index";
import type { TagColor } from "common/schemas/tag/index";

export type FolderNodeData = {
  label: string;
  devices: DeviceRelations[];
  connectingTagId: string;
  folderType: "dest" | "source";
  count: number;
};

export type TagNodeData = {
  label: string;
  id: string;
  name: string;
  color: TagColor;
  count: number;
};

export type RuleNodeData = {
  name: string;
  protocol: string;
  port: string;
  action: string;
};
