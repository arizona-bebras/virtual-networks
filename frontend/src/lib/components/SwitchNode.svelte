<script lang="ts">
import { Handle, type NodeProps, Position } from "@xyflow/svelte";

let { data }: NodeProps = $props();
</script>

<div
  class="flex size-15 items-center justify-center rounded-full border border-black"
>
  <p class="text-center text-[14px]">{data.label}</p>
</div>

<Handle type="target" position={Position.Left} />
<Handle type="source" position={Position.Right} />
