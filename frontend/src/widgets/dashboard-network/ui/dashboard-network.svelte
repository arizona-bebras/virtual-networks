<script lang="ts">
import {
  Background,
  Controls,
  type Connection,
  type Edge,
  type IsValidConnection,
  type Node,
  type OnConnectEnd,
  SvelteFlow,
} from "@xyflow/svelte";
import "@xyflow/svelte/dist/style.css";
import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/svelte-query";
import { untrack } from "svelte";
import type { DeviceRelations } from "common/schemas/device/index";
import type { RuleRelation } from "common/schemas/rule/index";
import type { Tag } from "common/schemas/tag/index";
import type { DeviceNodeData, RuleNodeData, TagNodeData } from "$entities/node/model/types";
import { tagDeviceCreation } from "$features/device-management/api/query";
import DeviceDialog from "$features/device-management/ui/device-dialog.svelte";
import {
  ruleDeletionMutation,
  ruleUpdateMutation,
} from "$features/rule-management/api/query";
import RuleDialog from "$features/rule-management/ui/rule-dialog.svelte";
import { tagDeletionMutation } from "$features/tag-management/api/query";
import TagDialog from "$features/tag-management/ui/tag-dialog.svelte";
import {
  deviceQuery,
  userRules,
} from "$pages/app/network/[slug]/rules/api/query";
import { deviceTags } from "$pages/app/network/[slug]/tags/api/query";
import { queryKeys } from "$shared/api/query-keys";
import { setDeviceEdit } from "$shared/lib/device-edit-context";
import { getNetworkId } from "$shared/lib/network-id-context";
import { resolveCollisions } from "$widgets/dashboard-network/model/resolve-collisions";
import { deviceToTagEdges, ruleEdges } from "../model/edges-generation";
import {
  deviceDataToNode,
  ruleDataToNode,
  tagDataToNode,
} from "../model/mapper";
import ConnectSuggestion from "./connect-suggestion.svelte";
import DeviceNode from "./device-node.svelte";
import EdgeDetailsDialog from "./edge-details-dialog.svelte";
import GraphContextMenu, {
  type ContextMenuAction,
  type ContextMenuKind,
} from "./graph-context-menu.svelte";
import GraphToolbar from "./graph-toolbar.svelte";
import RuleNode from "./rule-node.svelte";
import TagNode from "./tag-node.svelte";

let currentNetworkId = $derived(getNetworkId().id);
let networkTagsQuery = createQuery(() => deviceTags.userTags(currentNetworkId));
let networkRulesQuery = createQuery(() => userRules(currentNetworkId));
let networkDeviceQuery = createQuery(() =>
  deviceQuery.userDevices(currentNetworkId),
);

const nodeTypes = {
  device: DeviceNode,
  rule: RuleNode,
  tag: TagNode,
};

// graph state
let nodes = $state.raw<Node[]>([]);
let edges = $state.raw<Edge[]>([]);

// edge click dialog
let selectedEdge = $state<Edge | null>(null);
let isEdgeDialogOpen = $state(false);
let selectedEdgeSourceNode = $derived(selectedEdge ? (nodes.find((n) => n.id === selectedEdge?.source) ?? null) : null);
let selectedEdgeTargetNode = $derived(selectedEdge ? (nodes.find((n) => n.id === selectedEdge?.target) ?? null) : null);

// drag-to-rule creation
let pendingRule = $state<{ sourceId?: string; destId?: string } | null>(null);
let isRuleCreateOpen = $state(false);

// unconnected drop suggestion
type ConnectSuggestionState = { x: number; y: number; fromNodeType: string; fromNodeId: string } | null;
let connectSuggestion = $state<ConnectSuggestionState>(null);
let pendingDeviceLink = $state<string | null>(null);

// context menu
type ContextMenuState = {
  x: number;
  y: number;
  kind: ContextMenuKind;
  node?: Node;
} | null;
let contextMenu = $state<ContextMenuState>(null);

// create dialogs (toolbar + context menu)
let isTagCreateOpen = $state(false);
let isDeviceCreateOpen = $state(false);

// edit dialogs (context menu)
let editingTag = $state<Tag | null>(null);
let isTagEditOpen = $state(false);
let editingRule = $state<RuleRelation | null>(null);
let isRuleEditOpen = $state(false);

// device edit dialog (folder node → context)
let editingDevice = $state<DeviceRelations | null>(null);
let isDeviceEditOpen = $state(false);

setDeviceEdit({
  open: (device: DeviceRelations) => {
    editingDevice = device;
    isDeviceEditOpen = true;
  },
});

// delete mutations
const queryClient = useQueryClient();

const deleteTagMutation = createMutation(() =>
  tagDeletionMutation(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.network(currentNetworkId),
    });
  }),
);

const deleteRuleMutation = createMutation(() =>
  ruleDeletionMutation(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.networkRules(currentNetworkId),
    });
  }),
);

const updateRuleMutation = createMutation(() =>
  ruleUpdateMutation(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.networkRules(currentNetworkId),
    });
  }),
);

const addTagToDeviceMutation = createMutation(() =>
  tagDeviceCreation(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.networkDevices(currentNetworkId),
    });
  }),
);

$effect(() => {
  if (
    networkTagsQuery.isSuccess &&
    networkRulesQuery.isSuccess &&
    networkDeviceQuery.isSuccess
  ) {
    untrack(() => {
      const ruleNodes = ruleDataToNode(networkRulesQuery.data);
      const sourceTagNodes = tagDataToNode(
        networkTagsQuery.data,
        networkRulesQuery.data,
      );
      const destTagNodes = tagDataToNode(
        networkTagsQuery.data,
        networkRulesQuery.data,
        650,
        true,
      );
      const sourceDeviceNodes = deviceDataToNode(
        networkDeviceQuery.data,
        false,
        sourceTagNodes,
      );
      const destDeviceNodes = deviceDataToNode(
        networkDeviceQuery.data,
        true,
        destTagNodes,
      );
      const allTagNodeIds = new Set([
        ...sourceTagNodes.map((n) => n.id),
        ...destTagNodes.map((n) => n.id),
      ]);
      nodes = [
        ...sourceTagNodes,
        ...ruleNodes,
        ...sourceDeviceNodes,
        ...destDeviceNodes,
        ...destTagNodes,
      ];
      edges = [
        ...ruleEdges(networkRulesQuery.data, networkTagsQuery.data),
        ...deviceToTagEdges(
          sourceDeviceNodes.concat(destDeviceNodes),
          allTagNodeIds,
        ),
      ];
    });
  }
});

function handleEdgeClick(event: { edge: Edge }) {
  selectedEdge = event.edge;
  isEdgeDialogOpen = true;
}

function handleNodeDragStop(event: { targetNode: Node | null }) {
  if (event.targetNode) {
    nodes = resolveCollisions(nodes, event.targetNode.id);
  }
}

const isValidConnection: IsValidConnection = (conn) => {
  const src = nodes.find((n) => n.id === conn.source);
  const tgt = nodes.find((n) => n.id === conn.target);

  // source-tag → dest-tag: create a new rule
  if (src?.type === "tag" && tgt?.type === "tag") {
    return conn.source.startsWith("source-") && conn.target.startsWith("dest-");
  }

  // source-tag → rule: reassign rule's source tag
  if (src?.type === "tag" && tgt?.type === "rule") {
    return conn.source.startsWith("source-");
  }

  // rule → dest-tag: reassign rule's dest tag
  if (src?.type === "rule" && tgt?.type === "tag") {
    return conn.target.startsWith("dest-");
  }

  // source-device → source-tag: assign tag to device
  if (src?.type === "device" && tgt?.type === "tag") {
    return conn.source.startsWith("source-") && conn.target.startsWith("source-");
  }

  // dest-tag → dest-device: assign tag to device
  if (src?.type === "tag" && tgt?.type === "device") {
    return conn.source.startsWith("dest-") && conn.target.startsWith("dest-");
  }

  return false;
};

function handleConnect(conn: Connection) {
  const src = nodes.find((n) => n.id === conn.source);
  const tgt = nodes.find((n) => n.id === conn.target);

  // source-tag → dest-tag: open rule create dialog
  if (src?.type === "tag" && tgt?.type === "tag") {
    pendingRule = {
      sourceId: conn.source.slice("source-".length),
      destId: conn.target.slice("dest-".length),
    };
    isRuleCreateOpen = true;
    return;
  }

  // source-tag → rule: update rule's sourceId in-place
  if (src?.type === "tag" && tgt?.type === "rule") {
    updateRuleMutation.mutate({
      networkId: currentNetworkId,
      ruleId: conn.target,
      ruleInfo: { sourceId: conn.source.slice("source-".length) },
    });
    return;
  }

  // rule → dest-tag: update rule's destId in-place
  if (src?.type === "rule" && tgt?.type === "tag") {
    updateRuleMutation.mutate({
      networkId: currentNetworkId,
      ruleId: conn.source,
      ruleInfo: { destId: conn.target.slice("dest-".length) },
    });
    return;
  }

  // source-device → source-tag: assign that tag to the device
  if (src?.type === "device" && tgt?.type === "tag") {
    const deviceId = conn.source.slice("source-device-".length);
    const tagId = conn.target.slice("source-".length);
    addTagToDeviceMutation.mutate({
      networkId: currentNetworkId,
      deviceId,
      tagId,
    });
    return;
  }

  // dest-tag → dest-device: assign that tag to the device
  if (src?.type === "tag" && tgt?.type === "device") {
    const tagId = conn.source.slice("dest-".length);
    const deviceId = conn.target.slice("dest-device-".length);
    addTagToDeviceMutation.mutate({
      networkId: currentNetworkId,
      deviceId,
      tagId,
    });
  }
}

$effect(() => {
  if (!isRuleCreateOpen) pendingRule = null;
});

const handleConnectEnd: OnConnectEnd = (event, connectionState) => {
  if (connectionState.isValid) return;
  const fromNode = connectionState.fromNode;
  if (!fromNode || !fromNode.type || fromNode.type === "rule") return;
  const clientX = event instanceof MouseEvent ? event.clientX : event.changedTouches?.[0]?.clientX ?? 0;
  const clientY = event instanceof MouseEvent ? event.clientY : event.changedTouches?.[0]?.clientY ?? 0;
  connectSuggestion = { x: clientX, y: clientY, fromNodeType: fromNode.type, fromNodeId: fromNode.id };
};

function handlePaneContextMenu({ event }: { event: MouseEvent }) {
  event.preventDefault();
  contextMenu = {
    x: Math.min(event.clientX, window.innerWidth - 185),
    y: Math.min(event.clientY, window.innerHeight - 130),
    kind: "pane",
  };
}

function handleNodeContextMenu(event: { event: MouseEvent; node: Node }) {
  event.event.preventDefault();
  const validKinds: ContextMenuKind[] = ["tag", "rule", "device"];
  const kind: ContextMenuKind = validKinds.includes(
    event.node.type as ContextMenuKind,
  )
    ? (event.node.type as ContextMenuKind)
    : "device";
  contextMenu = {
    x: Math.min(event.event.clientX, window.innerWidth - 185),
    y: Math.min(event.event.clientY, window.innerHeight - 100),
    kind,
    node: event.node,
  };
}

function handleContextMenuAction(action: ContextMenuAction) {
  switch (action.type) {
    case "create-tag":
      isTagCreateOpen = true;
      break;
    case "create-device":
      isDeviceCreateOpen = true;
      break;
    case "create-rule":
      pendingRule = null;
      isRuleCreateOpen = true;
      break;
    case "edit-tag": {
      const d = action.node.data as TagNodeData;
      editingTag = {
        id: d.id,
        name: d.name,
        color: d.color === "gray" ? null : d.color,
        devicesCount: d.count,
      };
      isTagEditOpen = true;
      break;
    }
    case "delete-tag": {
      const d = action.node.data as TagNodeData;
      deleteTagMutation.mutate({
        networkId: currentNetworkId,
        tagId: d.id,
      });
      break;
    }
    case "edit-rule": {
      const d = action.node.data as RuleNodeData;
      editingRule = {
        id: action.node.id,
        description: d.name,
        protocol: d.protocol as "TCP" | "UDP" | "ICMP" | null,
        port: d.port !== "*" ? Number(d.port) : null,
        sourceId: d.sourceId,
        destId: d.destId,
        source: null,
        dest: null,
      };
      isRuleEditOpen = true;
      break;
    }
    case "delete-rule":
      deleteRuleMutation.mutate({
        networkId: currentNetworkId,
        ruleId: action.node.id,
      });
      break;
    case "edit-device": {
      const d = action.node.data as DeviceNodeData;
      editingDevice = d.device;
      isDeviceEditOpen = true;
      break;
    }
  }
}
</script>

<div class="w-screen h-screen">
  <SvelteFlow
    bind:nodes
    bind:edges
    {nodeTypes}
    fitView
    onedgeclick={handleEdgeClick}
    onnodedragstop={handleNodeDragStop}
    onconnect={handleConnect}
    onconnectend={handleConnectEnd}
    {isValidConnection}
    onpanecontextmenu={handlePaneContextMenu}
    onnodecontextmenu={handleNodeContextMenu}
    connectionLineStyle=""
    connectionRadius={40}

    class="relative"
  >
    <Background />
    <Controls />
    <GraphToolbar
      onopenTag={() => (isTagCreateOpen = true)}
      onopenDevice={() => (isDeviceCreateOpen = true)}
    />
  </SvelteFlow>


  {#if contextMenu}
    <GraphContextMenu
      x={contextMenu.x}
      y={contextMenu.y}
      kind={contextMenu.kind}
      node={contextMenu.node}
      onaction={handleContextMenuAction}
      onclose={() => (contextMenu = null)}
    />
  {/if}

  <!-- create dialogs -->
  <TagDialog
    bind:open={isTagCreateOpen}
    title="Новый тег"
    description="Создайте новый тег"
    oncreate={(tag) => {
      if (pendingDeviceLink) {
        addTagToDeviceMutation.mutate({ networkId: currentNetworkId, deviceId: pendingDeviceLink, tagId: tag.id });
        pendingDeviceLink = null;
      }
    }}
  />
  <DeviceDialog bind:open={isDeviceCreateOpen} title="Новое устройство" description="Добавьте устройство в сеть" />
  <DeviceDialog
    bind:open={isDeviceEditOpen}
    title="Редактировать устройство"
    description="Обновите данные устройства"
    device={editingDevice ?? undefined}
  />
  <RuleDialog
    bind:open={isRuleCreateOpen}
    title="Создать правило"
    description="Выберите параметры нового правила"
    initialValues={pendingRule ?? undefined}
  />

  <!-- edit dialogs (context menu) -->
  <TagDialog
    bind:open={isTagEditOpen}
    title="Редактировать тег"
    description="Обновите данные тега"
    tag={editingTag ?? undefined}
  />
  <RuleDialog
    bind:open={isRuleEditOpen}
    title="Редактировать правило"
    description="Обновите параметры правила"
    rule={editingRule ?? undefined}
  />

  <EdgeDetailsDialog
    bind:open={isEdgeDialogOpen}
    edge={selectedEdge}
    sourceNode={selectedEdgeSourceNode}
    targetNode={selectedEdgeTargetNode}
    networkId={currentNetworkId}
  />

  {#if connectSuggestion}
    <ConnectSuggestion
      x={connectSuggestion.x}
      y={connectSuggestion.y}
      fromNodeType={connectSuggestion.fromNodeType}
      fromNodeId={connectSuggestion.fromNodeId}
      onclose={() => (connectSuggestion = null)}
      oncreateTag={() => {
        const fromId = connectSuggestion?.fromNodeId ?? null;
        connectSuggestion = null;
        if (fromId?.startsWith("source-device-")) {
          pendingDeviceLink = fromId.slice("source-device-".length);
        } else if (fromId?.startsWith("dest-device-")) {
          pendingDeviceLink = fromId.slice("dest-device-".length);
        }
        isTagCreateOpen = true;
      }}
      oncreateRule={(initial) => {
        connectSuggestion = null;
        pendingRule = initial;
        isRuleCreateOpen = true;
      }}
    />
  {/if}
</div>
