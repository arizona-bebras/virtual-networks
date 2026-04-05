<script lang="ts">
	import { Handle, Position, useSvelteFlow, type NodeProps } from '@xyflow/svelte';

	let { data }: NodeProps = $props();
</script>

<div class="flex size-15 items-center justify-center rounded-full border border-black">
	<p class="text-[14px] text-center">{data.label}</p>
</div>

<Handle type="target" position={Position.Left} />
<Handle type="source" position={Position.Right} />