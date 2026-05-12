import type { Node } from "@xyflow/svelte";
import type { DeviceRelations } from "common/schemas/device/index";
import type { RuleRelation } from "common/schemas/rule/index";
import type { Tag } from "common/schemas/tag/index";
import type {
  FolderNodeData,
  RuleNodeData,
  TagNodeData,
} from "$entities/node/model/types";

const RULE_Y_STEP = 180;

export function ruleDataToNode(rules: RuleRelation[]): Node<RuleNodeData>[] {
  return rules.map((rule, index) => ({
    id: rule.id,
    type: "rule",
    data: {
      name: rule.description || "Default Rule",
      protocol: rule.protocol || "TCP",
      port: rule.port?.toString() || "*",
      action: "allow",
    },
    position: { x: 350, y: index * RULE_Y_STEP },
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
    const targetTagId = isDestNodes ? rule.destId : rule.sourceId;

    if (targetTagId) {
      const stats = tagRuleStats.get(targetTagId) || { sum: 0, count: 0 };
      stats.sum += i;
      stats.count += 1;
      tagRuleStats.set(targetTagId, stats);
    }
  }

  return userTags.map((tag, tagIndex) => {
    const stats = tagRuleStats.get(tag.id);
    let y: number;

    if (stats) {
      const avgRuleIndex = stats.sum / stats.count;
      y = avgRuleIndex * RULE_Y_STEP;
    } else {
      y = rules.length * RULE_Y_STEP + tagIndex * 100;
    }

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
      position: { x: positionX, y },
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

export function deviceDataToNode(
  devices: DeviceRelations[],
  isDestFolders: boolean = false,
  tagNodes: Node[] = [],
): Node<FolderNodeData>[] {
  const nodesMap = new Map<string, Node<FolderNodeData>>();
  const tagPosMap = new Map(tagNodes.map((n) => [n.data.id, n.position.y]));

  for (const device of devices) {
    for (const tag of device.tags) {
      const deviceTagId = tag.id;
      const nodeId = isDestFolders
        ? `dest-folder-${deviceTagId}`
        : `source-folder-${deviceTagId}`;

      const deviceData = {
        id: device.id,
        name: device.name,
        ip: device.ip,
        tag: tag.name,
        tagId: tag.id,
      };

      const existingNode = nodesMap.get(nodeId);
      if (existingNode) {
        existingNode.data.devices.push(deviceData);
        existingNode.data.count += 1;
      } else {
        const positionY = tagPosMap.get(deviceTagId) ?? 100;
        const positionX = isDestFolders ? 850 : -150;

        nodesMap.set(nodeId, {
          id: nodeId,
          type: "folder",
          data: {
            label: tag.name || "Unknown",
            devices: [deviceData],
            connectingTagId: deviceTagId,
            folderType: isDestFolders ? "dest" : "source",
            count: 1,
          },
          position: { x: positionX, y: positionY },
        });
      }
    }
  }

  return Array.from(nodesMap.values());
}
