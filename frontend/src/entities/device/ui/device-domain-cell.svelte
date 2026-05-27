<script lang="ts">
import { Copy } from "@lucide/svelte";
import { createQuery } from "@tanstack/svelte-query";
import { networkConfig } from "$pages/app/network/[slug]/config/api/query";
import { getNetworkId } from "$shared/lib/network-id-context";
import * as Tooltip from "$shared/ui/tooltip";

let currentNetworkId = $derived(getNetworkId().id);
const networkCfg = createQuery(() => networkConfig(currentNetworkId));
let { slug } = $props();
let open = $state(false);
const domain = $derived(`${slug}.${networkCfg.data?.domain}`);

function copy() {
  navigator.clipboard.writeText(domain);
  open = true;
}
</script>

<Tooltip.Provider>
  <Tooltip.Root bind:open disabled>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        <button
          {...props}
          type="button"
          class="flex items-center gap-1 underline decoration-dashed underline-offset-2 decoration-muted-foreground"
          onclick={copy}
        >
          <span class="font-medium">{domain}</span>
          <Copy class="size-3 text-muted-foreground" />
        </button>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content>
      <p>Скопировано</p>
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>
