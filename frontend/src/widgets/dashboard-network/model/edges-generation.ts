import type { Edge, Node } from "@xyflow/svelte";
import type { RuleRelation } from "common/schemas/rule/index";
import type { FolderNodeData } from "$entities/node/model/types";

export function generateEdges(rules: RuleRelation[]): Edge[] {
  const edges: Edge[] = [];
  for (const rule of rules) {
    if (rule.destId && rule.sourceId) {
      edges.push({
        id: rule.id + rule.description,
        source: `source-${rule.sourceId}`,
        target: rule.id,
      });
      edges.push({
        id: rule.id + rule.id,
        source: rule.id,
        target: `dest-${rule.destId}`,
      });
    }
  }
  return edges;
}

export function deviceFolderToTagEdges(
  deviceFolders: Node<FolderNodeData>[],
): Edge[] {
  const edges: Edge[] = [];
  for (const [index, folder] of deviceFolders.entries()) {
    if (folder.data.folderType === "dest")
      edges.push({
        id: `folder-source-${index + 1}`,
        source: folder.id,
        target: `source-${folder.data.connectingTagId}`,
      });
    else {
      console.log("ЕСТь!");
      edges.push({
        id: `folder-source-${index + 1}`,
        source: `dest-${folder.data.connectingTagId}`,
        target: folder.id,
      });
    }
  }
  return edges;
}
