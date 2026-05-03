import type { Node } from "@xyflow/svelte";
import type { DeviceRelations } from "common/schemas/device/index";
import type { RuleRelation } from "common/schemas/rule/index";
import type { Tag } from "common/schemas/tag/index";
import type { FolderNodeData } from "$entities/node/model/types";

export function tagDataToNode(
  userTags: Tag[],
  positionX: number = 100,
  isDestNodes: boolean = false,
): Node[] {
  return userTags.map((tag, index) => ({
    id: isDestNodes ? `dest-${tag.id}` : `source-${tag.id}`,
    type: "tag",
    data: {
      label: tag.name,
      id: tag.id,
      name: tag.name,
      color: tag.color,
      count: tag.devicesCount,
    },
    position: { x: positionX, y: 100 * index },
  }));
}

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
  const nodes: Node<FolderNodeData>[] = [];

  for (const device of devices) {
    for (const tag of device.tags) {
      const deviceTagId = tag.id;
    const nodeId = isDestFolders
      ? `dest-folder-${deviceTagId}`
      : `source-folder-${deviceTagId}`;
    const existingNode = nodes.find((node) => node.id === nodeId);
    const deviceData = {
      name: device.name,
      ip: device.ip,
        tag: tag.name,
        tagId: tag.id,
    };
    if (existingNode) {
      existingNode.data?.devices?.push(deviceData);
      existingNode.data.count += 1;
    } else {
      const tagNode = tagNodes.find((n) => n.data.id === deviceTagId);
      const positionY = tagNode ? tagNode.position.y : 100;
      const positionX = isDestFolders ? -150 : 850;

      nodes.push({
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
  return nodes;
}

export function ruleDataToNode(rules: RuleRelation[]): Node[] {
  return rules.map((rule, index) => ({
    id: rule.id,
    type: "rule",
    data: {
      name: rule.description || "Default Rule",
      protocol: rule.protocol || "TCP",
      port: rule.port?.toString() || "*",
      action: "allow",
    },
    position: { x: 350, y: 150 * index },
  }));
}
