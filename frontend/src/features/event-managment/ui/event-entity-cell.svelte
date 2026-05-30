<script lang="ts">
import { MonitorSmartphone, Shield, Tag } from "@lucide/svelte";
import type { Device } from "common/schemas/device/index";
import type { Rule } from "common/schemas/rule/index";
import type { Tag as TagType } from "common/schemas/tag/index";
import { getNetworkId } from "$shared/lib/network-id-context";

let { entity }: { entity: Device | Rule | TagType } = $props();

let currentNetwork = $derived(getNetworkId().id);

let isDevice = $derived("ip" in entity);
let isRule = $derived("protocol" in entity);
let isTag = $derived("color" in entity);
let redirectTo = $derived.by(() => {
  let basePath = `/app/network/${currentNetwork}`;
  if (isDevice) basePath += `/devices?name=${(entity as Device).name}`;
  else if (isRule)
    basePath += `/rules?description=${(entity as Rule).description}`;
  else if (isTag) basePath += `/tags?name=${(entity as TagType).name}`;
  return basePath;
});
</script>

<a
  class="flex items-center gap-2 underline decoration-dashed underline-offset-2 decoration-muted-foreground"
  href={redirectTo}
>
  {#if isDevice}
    <MonitorSmartphone class="size-4 text-muted-foreground" />
    <span class=" font-medium leading-none">{(entity as Device).name}</span>
  {:else if isRule}
    <Shield class="size-4 text-muted-foreground" />
    <span class=" font-medium leading-none">
      {(entity as Rule).description || 'Без описания'}
    </span>
  {:else if isTag}
    <Tag class="size-4 text-muted-foreground" />
    <span class=" font-medium leading-none">{(entity as TagType).name}</span>
  {:else}
    <span class="text-sm text-muted-foreground">Неизвестная сущность</span>
  {/if}
</a>
