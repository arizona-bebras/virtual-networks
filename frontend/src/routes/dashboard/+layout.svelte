<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/Sidebar.svelte';

	let { children } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<main class="relative w-screen">
		<Sidebar.Trigger class="absolute z-1  bg-green-500" />
		{@render children?.()}
	</main>
</Sidebar.Provider>
