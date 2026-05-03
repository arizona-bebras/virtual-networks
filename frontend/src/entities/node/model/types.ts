export type FolderNodeData = {
  label: string;
  devices: { name: string; ip: string; tag: string; tagId: string }[];
  connectingTagId: string;
  folderType: "dest" | "source";
  count: number;
};
