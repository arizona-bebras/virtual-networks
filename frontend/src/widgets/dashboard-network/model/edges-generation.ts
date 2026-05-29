import type { Edge, Node } from "@xyflow/svelte";
import type { RuleRelation } from "common/schemas/rule/index";
import type { Tag } from "common/schemas/tag/index";
import type { FolderNodeData } from "$entities/node/model/types";

function createEndpointEdges(
  ruleId: string,
  endpointId: string | null,
  tags: Tag[],
  isSource: boolean,
  ruleIndex: number,
): Edge[] {
  const endpoints = endpointId ? [{ id: endpointId }] : tags;

  return endpoints.map((endpoint) => {
    const idSuffix = endpointId
      ? `${ruleIndex + 1}`
      : `${ruleIndex + 1}-${endpoint.id}`;

    return isSource
      ? {
          id: `source-rule-${idSuffix}`,
          source: `source-${endpoint.id}`,
          target: ruleId,
        }
      : {
          id: `rule-dest-${idSuffix}`,
          source: ruleId,
          target: `dest-${endpoint.id}`,
        };
  });
}

export function ruleEdges(rules: RuleRelation[], tags: Tag[]): Edge[] {
  return rules.flatMap((rule, index) => [
    ...createEndpointEdges(rule.id, rule.sourceId, tags, true, index),
    ...createEndpointEdges(rule.id, rule.destId, tags, false, index),
  ]);
}

export function deviceFolderToTagEdges(
  deviceFolders: Node<FolderNodeData>[],
): Edge[] {
  const edges: Edge[] = [];
  for (const [index, folder] of deviceFolders.entries()) {
    if (folder.data.folderType === "source") {
      // Flow: Source Folder (-150) -> Source Tag (100)
      edges.push({
        id: `folder-source-${index + 1}`,
        source: folder.id,
        target: `source-${folder.data.connectingTagId}`,
      });
    } else {
      // Flow: Dest Tag (650) -> Dest Folder (850)
      edges.push({
        id: `dest-folder-${index + 1}`,
        source: `dest-${folder.data.connectingTagId}`,
        target: folder.id,
      });
    }
  }
  return edges;
}
