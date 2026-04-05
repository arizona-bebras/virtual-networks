<script lang="ts">
 import * as Sidebar from "$lib/components/ui/sidebar/index.js";
 import AppSidebar from "$lib/components/Sidebar.svelte";
 
 let { children } = $props();
</script>
 
<Sidebar.Provider>
 <AppSidebar />
 <main class="w-screen relative">
  <Sidebar.Trigger class="bg-green-500 absolute  z-1"/>
  {@render children?.()}
 </main>
</Sidebar.Provider>