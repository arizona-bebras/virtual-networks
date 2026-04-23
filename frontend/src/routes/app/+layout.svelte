<script lang="ts">
import { setContext } from "svelte";
import { page } from "$app/state";
import { getNetworkId, setNetworkId } from "$shared/lib/network-id-context";
import * as Sidebar from "$shared/ui/sidebar/index.js";
import AppSidebar from "$widgets/app-sidebar/ui/app-sidebar.svelte";

let { children } = $props();
let networkId = $derived(page.params.slug!);
setNetworkId({ get id() { return networkId; } });
</script>

<Sidebar.Provider>
  <AppSidebar />
  <main class="relative flex flex-1 flex-col overflow-hidden">
    <div class="flex items-center gap-2 px-4 py-2 border-b">
      <Sidebar.Trigger class="-ml-1" />
    </div>
    <div class="flex-1 overflow-auto">{@render children?.()}</div>
  </main>
</Sidebar.Provider>
