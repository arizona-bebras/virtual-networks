<script lang="ts">
	import ClientNode from '$lib/components/ClientNode.svelte';
	import SwitchNode from '$lib/components/SwitchNode.svelte';
	import DevicesMenu from '$lib/components/DevicesMenu.svelte';
	import { SvelteFlow, Background, type Connection, type Edge } from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';

	let deviceMenuOpen = $state(false);

	let nodes = $state.raw([]);
	// let edges = $state.raw([{ id: 'e1-2', source: '1', target: '2' }]);

	let nodeTypes = { clientNode: ClientNode, switchNode: SwitchNode };

	function isValidConnection(edge: Edge | Connection) {
		const sourceNodeid = edge.source;
		const targetNodeid = edge.target;
		if (sourceNodeid.startsWith('client')) return targetNodeid.startsWith('switch');
		if (sourceNodeid.startsWith('switch')) return targetNodeid.startsWith('server');
        return true
	}
</script>

<div class="relative h-screen w-full">
	<button
		class="absolute right-2 bottom-4 z-2 rounded bg-blue-500 p-2 text-white"
		onclick={() => (deviceMenuOpen = true)}>Добавить устройство</button
	>

	<SvelteFlow bind:nodes {nodeTypes} class="h-full w-full" {isValidConnection}>
		<Background />
	</SvelteFlow>

	<DevicesMenu bind:open={deviceMenuOpen} bind:nodes />
</div>
