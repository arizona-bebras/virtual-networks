import type { Node } from "@xyflow/svelte";
import type { Tag } from "common/schemas/tag/index";

export function tagDataToNode(userTags: Tag[]): Node[] {
  return userTags.map((device, index) => ({
    id: device.id,
    data: {
      label: device.name,
      id: device.id,
      name: device.name,
      color: device.color,
    },
    style: `background-color: ${device.color}`,
    position: { x: 100, y: 200 * index },
  }));
}
