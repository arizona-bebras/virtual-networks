import type { Edge, Node } from "@xyflow/svelte";
import type { RuleRelation } from "common/schemas/rule/index";
import type { FolderNodeData } from "$entities/node/model/types";

export function ruleEdges(rules: RuleRelation[]): Edge[] {
  const edges: Edge[] = [];
  for (const [index, rule] of rules.entries()) {
    if (rule.destId && rule.sourceId) {
      edges.push({
        id: `source-rule-${index + 1}`,
        source: `source-${rule.sourceId}`,
        target: rule.id,
      });
      edges.push({
        id: `rule-source-${index + 1}`,
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
      // console.log("ЕСТь!");
      edges.push({
        id: `dest-folder-${index + 1}`,
        source: `dest-${folder.data.connectingTagId}`,
        target: folder.id,
      });
    }
  }
  return edges;
}
