<script lang="ts">
import { MonitorSmartphone, Settings, Shield, Tag } from "@lucide/svelte";
import type { Device } from "common/schemas/device/index";
import type { EventEntity } from "common/schemas/event/index";
import type { Rule } from "common/schemas/rule/index";
import { getNetworkId } from "$shared/lib/network-id-context";

let { entity }: { entity: EventEntity } = $props();

let currentNetwork = $derived(getNetworkId().id);

let isDevice = $derived(entity.type === "device");
let isRule = $derived(entity.type === "rule");
let isTag = $derived(entity.type === "tag");
let isNetwork = $derived(entity.type === "network");

let redirectTo = $derived.by(() => {
  let basePath = `/app/network/${currentNetwork}`;
  if (entity.type === "device") basePath += `/devices?name=${entity.info.name}`;
  else if (entity.type === "rule")
    basePath += `/rules?description=${entity.info.description}`;
  else if (entity.type === "tag") basePath += `/tags?name=${entity.info.name}`;
  return basePath;
});
</script>

<a
  class="flex items-center gap-2 underline decoration-dashed underline-offset-2 decoration-muted-foreground"
  href={redirectTo}
>
  {#if entity.type === "device"}
    <MonitorSmartphone class="size-4 text-muted-foreground" />
    <span class=" font-medium leading-none">{entity.info.name}</span>
  {:else if entity.type === "rule"}
    <Shield class="size-4 text-muted-foreground" />
    <span class=" font-medium leading-none">
      {entity.info.description || 'Без описания'}
    </span>
  {:else if entity.type === "tag"}
    <Tag class="size-4 text-muted-foreground" />
    <span class=" font-medium leading-none">{entity.info.name}</span>
  {:else if entity.type === "network"}
    <Settings class="size-4 text-muted-foreground" />
    <span class=" font-medium leading-none">{entity.info.name}</span>
  {:else}
    <span class="text-sm text-muted-foreground">Неизвестная сущность</span>
  {/if}
</a>
