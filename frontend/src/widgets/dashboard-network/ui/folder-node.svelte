<script lang="ts">
import {
  ChevronRight,
  Folder,
  LayoutGrid,
  List,
  Monitor,
  Search,
  SquarePen,
  Ungroup,
} from "@lucide/svelte";
import {
  Handle,
  type Node,
  type NodeProps,
  NodeToolbar,
  Position,
} from "@xyflow/svelte";
import { flip } from "svelte/animate";
import { cubicOut } from "svelte/easing";
import { fly, slide } from "svelte/transition";
import type { DeviceRelations } from "common/schemas/device/index";
import { getDeviceEdit } from "$shared/lib/device-edit-context";
import { Button } from "$shared/ui/button/index.js";
import * as Card from "$shared/ui/card/index.js";
import { Input } from "$shared/ui/input/index.js";

// biome-ignore lint/suspicious/noExplicitAny: unused legacy component
let { id, data, selected }: NodeProps<Node<any>> = $props();

const deviceEdit = getDeviceEdit();

let displayMode = $state<"graphical" | "list">("graphical");
let searchQuery = $state("");

let filteredDevices = $derived(
  searchQuery
    // biome-ignore lint/suspicious/noExplicitAny: unused legacy component
    ? data.devices.filter((d: any) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : data.devices,
);

function handleBurst() {}

function openDeviceEdit(device: DeviceRelations, e: MouseEvent) {
  e.stopPropagation();
  deviceEdit.open(device);
}
</script>

<NodeToolbar {id} isVisible={selected} position={Position.Top}>
  <div
    class="flex items-center gap-1 bg-background/95 backdrop-blur-md border border-border p-1.5 rounded-2xl shadow-2xl"
  >
    <Button
      variant={displayMode === 'graphical' ? 'secondary' : 'ghost'}
      size="icon"
      class="size-9 rounded-xl transition-all"
      onclick={() => (displayMode = "graphical")}
    >
      <LayoutGrid size={18} />
    </Button>
    <Button
      variant={displayMode === 'list' ? 'secondary' : 'ghost'}
      size="icon"
      class="size-9 rounded-xl transition-all"
      onclick={() => (displayMode = "list")}
    >
      <List size={18} />
    </Button>
  </div>
</NodeToolbar>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if displayMode === "graphical"}
  <Card.Root
    onclick={() => { displayMode = 'list'}}
    class="w-44 bg-muted border-border hover:bg-muted/90 transition-all cursor-pointer group shadow-lg border-2"
  >
    <div class="p-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          class="p-2 bg-amber-500/20 rounded-lg group-hover:scale-110 transition-transform"
        >
          <Folder size={18} class="text-amber-500 fill-amber-500/20" />
        </div>
        <div class="flex flex-col min-w-0">
          <span class="text-xs font-bold truncate uppercase tracking-tight">
            {data.label || "Group"}
          </span>
          <span class="text-[9px] text-muted-foreground font-medium">
            {searchQuery ? filteredDevices.length : data.count || 0} устройств
          </span>
        </div>
      </div>
      <ChevronRight
        size={14}
        class="text-muted-foreground group-hover:translate-x-1 transition-transform"
      />
    </div>
  </Card.Root>
{:else if displayMode === 'list'}
  <Card.Root
    ondblclick={() => { displayMode = 'graphical'}}
    class="w-72 bg-background/40 backdrop-blur-xl border-border shadow-2xl border-2 overflow-hidden rounded-2xl"
  >
    <div
      class="p-3 bg-muted/20 border-b border-border flex justify-between items-center"
    >
      <div class="flex items-center gap-2">
        <Folder size={14} class="text-amber-500" />
        <span
          class="text-[11px] font-black uppercase tracking-widest text-foreground/80"
        >
          {data.label}
        </span>
      </div>
      <div class="px-2 py-0.5">
        <span class="text-[9px] text-primary font-black font-mono">
          {data.count} UNITS
        </span>
      </div>
    </div>

    <div class="px-3 py-1" onclick={(e) => e.stopPropagation()}>
      <div class="relative group/search">
        <Search
          size={10}
          class="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/search:text-primary transition-colors"
        />
        <Input
          placeholder="Название устройства..."
          bind:value={searchQuery}
          class="h-7 pl-6 pr-2 text-[10px] bg-background/50 border-border/50 focus:bg-background transition-all"
        />
      </div>
    </div>

    <div
      class="max-h-64 overflow-y-auto overflow-x-hidden p-2 flex flex-col gap-2 custom-scrollbar bg-gradient-to-b from-transparent to-muted/5"
    >
      {#each filteredDevices as device (device.ip)}
        <div
          class="p-3 flex items-center gap-3 bg-muted/30 hover:bg-primary/5 rounded-xl transition-all border border-border/50  group relative overflow-hidden"
        >
          <div
            class="p-2 bg-background/50 rounded-lg border border-border/50 group-hover:border-primary/30 group-hover:bg-secondary/85 transition-all shadow-sm"
          >
            <Monitor
              size={16}
              class="text-muted-foreground group-hover:stroke-white transition-colors"
            />
          </div>

          <div class="flex flex-col min-w-0 flex-1">
            <span
              class="text-[11px] font-bold truncate group-hover:text-secondary transition-colors"
            >
              {device.name}
            </span>
            <span
              class="text-[9px] text-muted-foreground/70 font-mono tracking-tight tabular-nums"
            >
              {device.ip}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            class="size-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onclick={(e) => openDeviceEdit(device, e)}
          >
            <SquarePen size={11} />
          </Button>

          <div
            class="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 translate-x-full group-hover:translate-x-0 transition-transform duration-500 -z-10"
          ></div>
        </div>
      {/each}
    </div>
  </Card.Root>
{/if}

<Handle
  type="target"
  position={Position.Left}
  class="!size-2.5 !bg-primary border-2 border-background"
/>
<Handle
  type="source"
  position={Position.Right}
  class="!size-2.5 !bg-primary border-2 border-background"
/>
