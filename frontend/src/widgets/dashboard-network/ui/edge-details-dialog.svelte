<script lang="ts">
import {
  AlertCircle,
  Cable,
  Monitor,
  Shield,
  Tag,
  Trash2,
} from "@lucide/svelte";
import { createMutation, useQueryClient } from "@tanstack/svelte-query";
import type { Edge, Node } from "@xyflow/svelte";
import type {
  DeviceNodeData,
  RuleNodeData,
  TagNodeData,
} from "$entities/node/model/types";
import { tagDeviceRemove } from "$features/device-management/api/query";
import { ruleUpdateMutation } from "$features/rule-management/api/query";
import { queryKeys } from "$shared/api/query-keys";
import { Button } from "$shared/ui/button/index.js";
import * as Dialog from "$shared/ui/dialog/index.js";

let {
  open = $bindable(),
  edge,
  sourceNode,
  targetNode,
  networkId,
}: {
  open: boolean;
  edge: Edge | null;
  sourceNode: Node | null;
  targetNode: Node | null;
  networkId: string;
} = $props();

const queryClient = useQueryClient();

const removeTagMutation = createMutation(() =>
  tagDeviceRemove(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.networkDevices(networkId),
    });
    open = false;
  }),
);

const detachRuleMutation = createMutation(() =>
  ruleUpdateMutation(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.networkRules(networkId),
    });
    open = false;
  }),
);

type EdgeKind =
  | "device-to-tag"
  | "tag-to-device"
  | "tag-to-rule"
  | "rule-to-tag"
  | "unknown";

let edgeKind: EdgeKind = $derived(
  !sourceNode || !targetNode
    ? "unknown"
    : sourceNode.type === "device" && targetNode.type === "tag"
      ? "device-to-tag"
      : sourceNode.type === "tag" && targetNode.type === "device"
        ? "tag-to-device"
        : sourceNode.type === "tag" && targetNode.type === "rule"
          ? "tag-to-rule"
          : sourceNode.type === "rule" && targetNode.type === "tag"
            ? "rule-to-tag"
            : "unknown",
);

let isDeleting = $derived(
  removeTagMutation.isPending || detachRuleMutation.isPending,
);

function handleDelete() {
  if (!edge) return;
  if (edgeKind === "device-to-tag") {
    removeTagMutation.mutate({
      networkId,
      deviceId: edge.source.slice("source-device-".length),
      tagId: edge.target.slice("source-".length),
    });
  } else if (edgeKind === "tag-to-device") {
    removeTagMutation.mutate({
      networkId,
      tagId: edge.source.slice("dest-".length),
      deviceId: edge.target.slice("dest-device-".length),
    });
  } else if (edgeKind === "tag-to-rule") {
    detachRuleMutation.mutate({
      networkId,
      ruleId: edge.target,
      ruleInfo: { sourceId: null },
    });
  } else if (edgeKind === "rule-to-tag") {
    detachRuleMutation.mutate({
      networkId,
      ruleId: edge.source,
      ruleInfo: { destId: null },
    });
  }
}

function nodeLabel(node: Node | null): string {
  if (!node) return "—";
  if (node.type === "device") return (node.data as DeviceNodeData).name;
  if (node.type === "tag") return (node.data as TagNodeData).name;
  if (node.type === "rule") return (node.data as RuleNodeData).name;
  return node.id;
}

function nodeSublabel(node: Node | null): string {
  if (!node) return "";
  if (node.type === "device") return (node.data as DeviceNodeData).ip;
  if (node.type === "tag") return `${(node.data as TagNodeData).count} устр.`;
  if (node.type === "rule") {
    const d = node.data as RuleNodeData;
    return `${d.protocol} · ${d.port}`;
  }
  return "";
}

const kindTitle: Record<EdgeKind, string> = {
  "device-to-tag": "Назначение тега",
  "tag-to-device": "Назначение тега",
  "tag-to-rule": "Источник правила",
  "rule-to-tag": "Назначение правила",
  unknown: "Связь",
};

const kindDescription: Record<EdgeKind, string> = {
  "device-to-tag":
    "Устройство привязано к тегу. Удаление отвяжет его и уберёт из тегового сегмента.",
  "tag-to-device":
    "Устройство привязано к тегу. Удаление отвяжет его и уберёт из тегового сегмента.",
  "tag-to-rule":
    "Тег задаёт источник трафика в правиле. Удаление освободит поле источника.",
  "rule-to-tag":
    "Тег задаёт назначение трафика в правиле. Удаление освободит поле назначения.",
  unknown: "Удалить эту связь?",
};

const nodeColors: Record<string, string> = {
  device: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  tag: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  rule: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

const nodeTypeBadge: Record<string, string> = {
  device: "Устройство",
  tag: "Тег",
  rule: "Правило",
};
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-[420px] gap-0 p-0 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border">
      <div class="p-2 rounded-lg bg-primary/10 border border-primary/20">
        <Cable class="size-4 text-primary" />
      </div>
      <div>
        <Dialog.Title class="text-sm font-semibold leading-none mb-0.5">
          Детали связи
        </Dialog.Title>
        <Dialog.Description
          class="text-[11px] text-muted-foreground leading-none"
        >
          {kindTitle[edgeKind]}
        </Dialog.Description>
      </div>
    </div>

    <!-- Connection visualizer -->
    <div class="px-5 py-5">
      <div class="flex items-center gap-3">
        <!-- Source node card -->
        <div class="flex-1 rounded-xl border bg-muted/40 p-3 min-w-0">
          <div class="flex items-center gap-2 mb-1.5">
            <div
              class="p-1.5 rounded-md border {nodeColors[sourceNode?.type ?? 'rule']} shrink-0"
            >
              {#if sourceNode?.type === "device"}
                <Monitor class="size-3" />
              {:else if sourceNode?.type === "tag"}
                <Tag class="size-3" />
              {:else}
                <Shield class="size-3" />
              {/if}
            </div>
            <span
              class="text-[9px] font-bold uppercase tracking-wider text-muted-foreground truncate"
            >
              {nodeTypeBadge[sourceNode?.type ?? ""] ?? "—"}
            </span>
          </div>
          <p class="text-xs font-semibold truncate leading-tight">
            {nodeLabel(sourceNode)}
          </p>
          {#if nodeSublabel(sourceNode)}
            <p
              class="text-[10px] text-muted-foreground font-mono mt-0.5 truncate"
            >
              {nodeSublabel(sourceNode)}
            </p>
          {/if}
        </div>

        <!-- Arrow -->
        <div class="flex flex-col items-center gap-0.5 shrink-0">
          <div
            class="h-px w-6 bg-gradient-to-r from-border to-primary/50"
          ></div>
          <div class="size-1.5 rounded-full bg-primary/70"></div>
          <div
            class="h-px w-6 bg-gradient-to-r from-primary/50 to-border"
          ></div>
        </div>

        <!-- Target node card -->
        <div class="flex-1 rounded-xl border bg-muted/40 p-3 min-w-0">
          <div class="flex items-center gap-2 mb-1.5">
            <div
              class="p-1.5 rounded-md border {nodeColors[targetNode?.type ?? 'rule']} shrink-0"
            >
              {#if targetNode?.type === "device"}
                <Monitor class="size-3" />
              {:else if targetNode?.type === "tag"}
                <Tag class="size-3" />
              {:else}
                <Shield class="size-3" />
              {/if}
            </div>
            <span
              class="text-[9px] font-bold uppercase tracking-wider text-muted-foreground truncate"
            >
              {nodeTypeBadge[targetNode?.type ?? ""] ?? "—"}
            </span>
          </div>
          <p class="text-xs font-semibold truncate leading-tight">
            {nodeLabel(targetNode)}
          </p>
          {#if nodeSublabel(targetNode)}
            <p
              class="text-[10px] text-muted-foreground font-mono mt-0.5 truncate"
            >
              {nodeSublabel(targetNode)}
            </p>
          {/if}
        </div>
      </div>

      <!-- Info banner -->
      <div
        class="mt-4 flex items-start gap-2.5 rounded-lg border border-border bg-muted/30 px-3 py-2.5"
      >
        <AlertCircle class="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <p class="text-[11px] text-muted-foreground leading-relaxed">
          {kindDescription[edgeKind]}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <Dialog.Footer class="px-5 pb-5 pt-0 flex gap-2">
      <Button
        variant="outline"
        class="flex-1"
        onclick={() => (open = false)}
        disabled={isDeleting}
      >
        Отмена
      </Button>
      <Button
        variant="destructive"
        class="flex-1 gap-1.5"
        onclick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 class="size-3.5" />
        {isDeleting ? "Удаление…" : "Удалить связь"}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
