import type { Node } from "@xyflow/svelte";

export function resolveCollisions(nodes: Node[], draggedNodeId?: string) {
  const result = nodes.map((n) => ({ ...n, position: { ...n.position } }));
  const draggedNode = draggedNodeId
    ? result.find((n) => n.id === draggedNodeId)
    : null;

  if (!draggedNode) return nodes;

  // Actual dimensions from our components
  const getDimensions = (node: Node) => {
    if (node.type === "device") return { width: 192, height: 65 }; // w-48 is 192px
    if (node.type === "rule") return { width: 112, height: 24 }; // w-28 is 112px
    return { width: 150, height: 50 };
  };

  const draggedDim = getDimensions(draggedNode);
  const margin = 15;

  // Resolve collisions iteratively for better stability
  for (let iter = 0; iter < 3; iter++) {
    let moved = false;
    for (let i = 0; i < result.length; i++) {
      const node = result[i];
      if (!node || node.id === draggedNodeId) continue;

      const nodeDim = getDimensions(node);

      // AABB check
      const isColliding =
        draggedNode.position.x < node.position.x + nodeDim.width + margin &&
        draggedNode.position.x + draggedDim.width + margin > node.position.x &&
        draggedNode.position.y < node.position.y + nodeDim.height + margin &&
        draggedNode.position.y + draggedDim.height + margin > node.position.y;

      if (isColliding) {
        // Calculate overlap
        const overlapX1 =
          draggedNode.position.x + draggedDim.width + margin - node.position.x;
        const overlapX2 =
          node.position.x + nodeDim.width + margin - draggedNode.position.x;
        const overlapY1 =
          draggedNode.position.y + draggedDim.height + margin - node.position.y;
        const overlapY2 =
          node.position.y + nodeDim.height + margin - draggedNode.position.y;

        const overlapX = Math.min(overlapX1, overlapX2);
        const overlapY = Math.min(overlapY1, overlapY2);

        if (overlapX < overlapY) {
          if (draggedNode.position.x < node.position.x) {
            node.position.x += overlapX;
          } else {
            node.position.x -= overlapX;
          }
        } else {
          if (draggedNode.position.y < node.position.y) {
            node.position.y += overlapY;
          } else {
            node.position.y -= overlapY;
          }
        }
        moved = true;
      }
    }
    if (!moved) break;
  }

  return result;
}
