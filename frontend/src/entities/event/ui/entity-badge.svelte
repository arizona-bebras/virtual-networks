<script lang="ts">
import { MonitorSmartphone, Settings, Shield, Tag, X } from "@lucide/svelte";

let {
  entityType,
  onclick,
}: {
  entityType: "device" | "rule" | "tag" | "network";
  onclick?: () => void;
} = $props();

const config = {
  device: {
    icon: MonitorSmartphone,
    label: "Устройства",
  },
  rule: {
    icon: Shield,
    label: "Правила",
  },
  tag: {
    icon: Tag,
    label: "Теги",
  },
  network: {
    icon: Settings,
    label: "Конфигурация",
  },
} as const;

let currentConfig = $derived(config[entityType]);
</script>

{#if currentConfig}
  <div
    class="flex items-center gap-1.5 px-2 py-1 bg-primary rounded-[4px] text-[12px] font-medium w-fit border border-border"
  >
    <currentConfig.icon class="size-3.5 text-muted-foreground" />
    <span>{currentConfig.label}</span>
    {#if onclick}
      <button
        type="button"
        class="ml-0.5 rounded-full outline-none hover:bg-muted p-0.5 transition-colors"
        {onclick}
      >
        <X class="size-3 text-muted-foreground hover:text-foreground" />
      </button>
    {/if}
  </div>
{/if}
