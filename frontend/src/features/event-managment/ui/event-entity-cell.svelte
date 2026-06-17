<script lang="ts">
import { MonitorSmartphone, Settings, Shield, Tag } from "@lucide/svelte";
import type { EventEntity } from "common/schemas/event/index";
import { getNetworkId } from "$shared/lib/network-id-context";

let { entity }: { entity: EventEntity } = $props();

let currentNetwork = $derived(getNetworkId().id);

let redirectTo = $derived.by(() => {
  if (!entity.info) {
    return undefined;
  }

  let basePath = `/app/network/${currentNetwork}`;
  if (entity.type === "device") basePath += `/devices?name=${entity.info.name}`;
  else if (entity.type === "rule")
    basePath += `/rules?description=${entity.info.description}`;
  else if (entity.type === "tag") basePath += `/tags?name=${entity.info.name}`;
  else if (entity.type === "network") basePath += "/config";
  return basePath;
});

let label = $derived.by(() => {
  if (entity.type === "device")
    return entity.info?.name ?? "Удаленное устройство";
  if (entity.type === "rule")
    return entity.info?.description || "Удаленное правило";
  if (entity.type === "tag") return entity.info?.name ?? "Удаленный тег";
  if (entity.type === "network") return entity.info?.name ?? "Удаленная сеть";
  return "Неизвестная сущность";
});
</script>

<a
  class="flex items-center gap-2 underline decoration-dashed underline-offset-2 decoration-muted-foreground"
  href={redirectTo ?? undefined}
>
  {#if entity.type === "device"}
    <MonitorSmartphone class="size-4 text-muted-foreground" />
    <span class=" font-medium leading-none">{label}</span>
  {:else if entity.type === "rule"}
    <Shield class="size-4 text-muted-foreground" />
    <span class=" font-medium leading-none">{label}</span>
  {:else if entity.type === "tag"}
    <Tag class="size-4 text-muted-foreground" />
    <span class=" font-medium leading-none">{label}</span>
  {:else if entity.type === "network"}
    <Settings class="size-4 text-muted-foreground" />
    <span class=" font-medium leading-none">{label}</span>
  {:else}
    <span class="text-sm text-muted-foreground">Неизвестная сущность</span>
  {/if}
</a>
