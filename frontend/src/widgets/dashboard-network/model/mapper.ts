import type { Node } from "@xyflow/svelte";
import type { DeviceRelations } from "common/schemas/device/index";
import type { RuleRelation } from "common/schemas/rule/index";
import type { Tag } from "common/schemas/tag/index";

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

export function deviceDataToNode(devices: DeviceRelations[]): Node[] {
  return devices.map((device, index) => ({
    id: device.id,
    type: "device",
    data: {
      name: device.name,
      ip: device.ip,
      tags: device.tags.map((t) => t.name),
      online: true,
    },
    position: { x: 50, y: 150 * index },
  }));
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
