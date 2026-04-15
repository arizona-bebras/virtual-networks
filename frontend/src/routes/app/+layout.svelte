<script lang="ts">
import AppSidebar from "$lib/components/Sidebar.svelte";
import * as Sidebar from "$lib/components/ui/sidebar/index.js";

let { children } = $props();
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
