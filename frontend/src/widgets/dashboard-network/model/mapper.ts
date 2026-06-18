import type { Node } from "@xyflow/svelte";
import type { DeviceRelations } from "common/schemas/device/index";
import type { RuleRelation } from "common/schemas/rule/index";
import type { Tag } from "common/schemas/tag/index";
import type {
  DeviceNodeData,
  RuleNodeData,
  TagNodeData,
} from "$entities/node/model/types";

const RULE_Y_STEP = 135;
const TAG_Y_STEP = RULE_Y_STEP;
const DEVICE_Y_WITHOUT_TAGS = 150;
// const DEVICE_DEFAULT_Y = 100;

export function ruleDataToNode(rules: RuleRelation[]): Node<RuleNodeData>[] {
  const sortedRules = [...rules].sort((a, b) => {
    const aIsGlobal = !a.sourceId && !a.destId;
    const bIsGlobal = !b.sourceId && !b.destId;

    if (aIsGlobal && !bIsGlobal) return 1;
    if (!aIsGlobal && bIsGlobal) return -1;
    return 0;
  });

  return sortedRules.map((rule, index) => ({
    id: rule.id,
    type: "rule",
    data: {
      name: rule.description || "Default Rule",
      protocol: rule.protocol || "TCP",
      port: rule.port?.toString() || "*",
      action: "allow",
      sourceId: rule.sourceId ?? null,
      destId: rule.destId ?? null,
    },
    position: { x: 350, y: (index + 1) * RULE_Y_STEP },
  }));
}

export function tagDataToNode(
  userTags: Tag[],
  rules: RuleRelation[],
  positionX: number = 100,
  isDestNodes: boolean = false,
): Node<TagNodeData>[] {
  const tagRuleStats = new Map<string, { sum: number; count: number }>();

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]!;

    const addStat = (tagId: string | null) => {
      if (tagId) {
        const stats = tagRuleStats.get(tagId) || { sum: 0, count: 0 };
        stats.sum += i;
        stats.count += 1;
        tagRuleStats.set(tagId, stats);
      }
    };

    addStat(rule.sourceId);
    addStat(rule.destId);
  }

  const sortedTags = [...userTags].sort((a, b) => {
    const statsA = tagRuleStats.get(a.id);
    const statsB = tagRuleStats.get(b.id);

    const idealYA = statsA
      ? Math.round(statsA.sum / statsA.count) * TAG_Y_STEP
      : Infinity;
    const idealYB = statsB
      ? Math.round(statsB.sum / statsB.count) * TAG_Y_STEP
      : Infinity;

    if (idealYA !== idealYB) {
      return idealYA - idealYB;
    }
    return (a.name || "").localeCompare(b.name || "");
  });

  const MIN_NODE_GAP = TAG_Y_STEP;
  const usedYPositions: number[] = [];

  return sortedTags.map((tag) => {
    const stats = tagRuleStats.get(tag.id);
    let idealY: number;

    if (stats) {
      idealY = Math.round(stats.sum / stats.count) * TAG_Y_STEP;
    } else {
      idealY = rules.length * TAG_Y_STEP;
    }

    let actualY = idealY;
    while (
      usedYPositions.some((usedY) => Math.abs(usedY - actualY) < MIN_NODE_GAP)
    ) {
      actualY += MIN_NODE_GAP;
    }

    usedYPositions.push(actualY);

    return {
      id: isDestNodes ? `dest-${tag.id}` : `source-${tag.id}`,
      type: "tag",
      data: {
        label: tag.name,
        id: tag.id,
        name: tag.name,
        color: tag.color,
        count: tag.devicesCount,
      },
      position: { x: positionX, y: actualY },
    };
  });
}

// Прекрасная функция

// export function deviceDataToNode(
//   devices: DeviceRelations[],
//   rules: RuleRelation[],
// ): Node[] {
//   const sourceIds = rules.map((rule) => rule.sourceId);
//   const destIds = rules.map((rule) => rule.destId);
//   const nodes: Node<FolderNodeData>[] = [];

//   for (const device of devices) {
//     const deviceTagId = device.tags[0]?.id;
//     const isLeftDeviceFolder = sourceIds.includes(deviceTagId);
//     if (isLeftDeviceFolder || destIds.includes(deviceTagId)) {
//       const existingNode = nodes.find(
//         (node) => node.id === `folder-${deviceTagId}`,
//       );
//       const deviceData = {
//         name: device.name,
//         ip: device.ip,
//         tag: device.tags[0]?.name,
//         tagId: device.tags[0]?.id,
//       };
//       if (existingNode) {
//         existingNode.data?.devices?.push(deviceData);
//         existingNode.data.count += 1;
//       } else {
//         nodes.push({
//           id: `folder-${deviceTagId}`,
//           type: "folder",
//           data: {
//             label: device.name,
//             devices: [deviceData],
//             count: 1,
//           },
//           position: { x: 0, y: isLeftDeviceFolder ? 100 : 500 },
//         });
//       }
//     }
//   }
//   console.log("Итоговые папки:", nodes);
//   return nodes;
// }
const DEVICE_SPACING = 65;

export function deviceDataToNode(
  devices: DeviceRelations[] | undefined,
  isDestSide: boolean = false,
  tagNodes: Node[] = [],
): Node<DeviceNodeData>[] {
  const tagPosMap = new Map<string, number>(
    tagNodes.map((n) => [n.data.id as string, n.position.y]),
  );

  const POSITION_X = isDestSide ? 950 : -250;
  const SIDE = isDestSide ? "dest" : "source";
  const tagYValues = Array.from(tagPosMap.values());
  const fallbackY =
    (tagYValues.length > 0 ? Math.max(...tagYValues) : 0) +
    DEVICE_Y_WITHOUT_TAGS;

  // Slot counter: baseY → how many devices are already placed at that y band
  const ySlots = new Map<number, number>();

  return (devices ?? []).map((device) => {
    const firstKnownTag = device.tags?.find((t) => tagPosMap.has(t.id));
    const baseY = firstKnownTag
      ? (tagPosMap.get(firstKnownTag.id) ?? fallbackY)
      : fallbackY;

    const slot = ySlots.get(baseY) ?? 0;
    ySlots.set(baseY, slot + 1);

    return {
      id: `${SIDE}-device-${device.id}`,
      type: "device",
      data: {
        id: device.id,
        name: device.name,
        ip: device.ip,
        device,
      },
      position: { x: POSITION_X, y: baseY + slot * DEVICE_SPACING },
    };
  });
}
