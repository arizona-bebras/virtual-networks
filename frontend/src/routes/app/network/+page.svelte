<script lang="ts">
	import ClientNode from '$lib/components/ClientNode.svelte';
	import SwitchNode from '$lib/components/SwitchNode.svelte';
	import DevicesMenu from '$lib/components/DevicesMenu.svelte';
	import { SvelteFlow, Background, type Connection, type Edge } from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import EdgeInfo from '$lib/components/EdgeInfo.svelte';
	import type { EdgeData } from '$lib/components/edgesTypes';

	let deviceMenuOpen = $state(false);
	let isEdgeInfoOpen = $state(false);
	let edgeData = $state<null | { edge: Edge<EdgeData>; event: MouseEvent }>(null);
	let nodes = $state.raw([]);
	let edges: Edge<EdgeData>[] = $state.raw([]);

	let nodeTypes = { clientNode: ClientNode, switchNode: SwitchNode };

	function isValidConnection(edge: Edge | Connection) {
		const sourceNodeid = edge.source;
		const targetNodeid = edge.target;
		if (sourceNodeid.startsWith('client')) return targetNodeid.startsWith('switch');
		if (sourceNodeid.startsWith('switch')) return targetNodeid.startsWith('server');
		return true;
	}

	function getConnectionType(
		connection: Connection
	): 'client-switch' | 'switch-server' | 'unknown' {
		const source = connection.source;
		const target = connection.target;
		if (source.startsWith('client') && target.startsWith('switch')) return 'client-switch';
		if (source.startsWith('switch') && target.startsWith('server')) return 'switch-server';
		return 'unknown';
	}
</script>

<div class="relative h-screen w-full">
	<button
		class="absolute right-2 bottom-4 z-2 rounded bg-blue-500 p-2 text-white"
		onclick={() => (deviceMenuOpen = true)}>Добавить устройство</button
	>

	<SvelteFlow
		bind:nodes
		bind:edges
		{nodeTypes}
		class="h-full w-full"
		{isValidConnection}
		onedgeclick={(evt: { edge: Edge<EdgeData>; event: MouseEvent }) => {
			isEdgeInfoOpen = true;
			edgeData = evt;
		}}
		// onconnect={(evt) => {
		// 	const connectionType = getConnectionType(evt);
		// 	const newEdge: Edge<EdgeData> = {
		// 		source: evt.source,
		// 		target: evt.target,
		// 		id: `edge-${edges.length + 1}`
		// 	};

		// 	if (connectionType === 'client-switch') {
		// 		newEdge.data = {
		// 			connectionType: connectionType,
		// 			speed: Math.floor(Math.random() * 10) + 1
		// 		};
		// 	}
		// 	if (connectionType === 'switch-server') {
		// 		newEdge.data = { connectionType: connectionType, status: 'ОК' };
		// 	}
		// 	// Создаются дубли, надо бы исправить
		// 	edges = [...edges, newEdge];
		// 	console.log('Подключение изменено', edges);
		// }}
		onbeforeconnect={(connection: Connection) => {
			const connectionType = getConnectionType(connection);
			const newEdge: Edge<EdgeData> = {
				source: connection.source,
				target: connection.target,
				id: `edge-${edges.length + 1}`
			};

			if (connectionType === 'client-switch') {
				newEdge.data = {
					connectionType: connectionType,
					speed: Math.floor(Math.random() * 10) + 1
				};
			}
			if (connectionType === 'switch-server') {
				newEdge.data = { connectionType: connectionType, status: 'ОК' };
			}
			edges = [...edges, newEdge];
			console.log('Подключение изменено', edges);
		}}
	>
		<Background />
	</SvelteFlow>

	<DevicesMenu bind:open={deviceMenuOpen} bind:nodes />
	<EdgeInfo bind:open={isEdgeInfoOpen} edgeData={edgeData!} />
</div>
