import type { TagColor } from "common/schemas/tag/index";

export type FolderNodeData = {
  label: string;
  devices: { name: string; ip: string; tag: string; tagId: string }[];
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
