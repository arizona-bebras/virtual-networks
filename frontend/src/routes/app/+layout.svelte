<script lang="ts">
import * as Sidebar from "$lib/components/ui/sidebar/index.js";
import AppSidebar from "$lib/components/Sidebar.svelte";
import { goto } from "$app/navigation";

let { children } = $props();
</script>

<Sidebar.Provider>
  <AppSidebar />
  <main class="relative w-screen">
    <Sidebar.Trigger class=" bg-green-500" />
    {@render children?.()}
    <button
      class="bg-red-400 text-white p-1 rounded right-1 top-1 absolute"
      onclick={() => {
			localStorage.removeItem('token');
			goto('/auth/login')
		}}
    >
      Выйти с аккаунта
    </button>
  </main>
</Sidebar.Provider>
