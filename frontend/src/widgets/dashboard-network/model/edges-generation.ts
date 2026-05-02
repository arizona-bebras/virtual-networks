import type { Edge } from "@xyflow/svelte";
import type { RuleRelation } from "common/schemas/rule/index";

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
