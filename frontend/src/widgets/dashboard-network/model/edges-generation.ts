import type { Edge, Node } from "@xyflow/svelte";
import type { RuleRelation } from "common/schemas/rule/index";
import type { Tag } from "common/schemas/tag/index";
import type { DeviceNodeData } from "$entities/node/model/types";

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

export function deviceToTagEdges(
  deviceNodes: Node<DeviceNodeData>[],
  tagNodeIds: Set<string>,
): Edge[] {
  const edges: Edge[] = [];

  for (const deviceNode of deviceNodes) {
    const isSourceSide = deviceNode.id.startsWith("source-");
    const { device } = deviceNode.data;

    for (const tag of device.tags ?? []) {
      if (isSourceSide) {
        const tagNodeId = `source-${tag.id}`;
        if (tagNodeIds.has(tagNodeId)) {
          edges.push({
            id: `${deviceNode.id}--${tagNodeId}`,
            source: deviceNode.id,
            target: tagNodeId,
          });
        }
      } else {
        const tagNodeId = `dest-${tag.id}`;
        if (tagNodeIds.has(tagNodeId)) {
          edges.push({
            id: `${tagNodeId}--${deviceNode.id}`,
            source: tagNodeId,
            target: deviceNode.id,
          });
        }
      }
    }
  }

  return edges;
}
