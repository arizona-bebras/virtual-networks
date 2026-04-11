<script lang="ts">
import type { Edge } from "@xyflow/svelte";
import type { EdgeData } from "$lib/components/edgesTypes";
import * as Dialog from "$lib/components/ui/dialog/index.js";

let {
  open = $bindable(),
  edgeData,
}: {
  open: boolean;
  edgeData: { edge: Edge<EdgeData>; event: MouseEvent };
} = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Информация о подключении</Dialog.Title>
      <Dialog.Description>
        <p>{edgeData.edge.source} -&gt; {edgeData.edge.target}</p>
        {#if edgeData.edge.data?.connectionType === 'client-switch'}
          <p>Скорость: {edgeData.edge.data.speed} Gbps</p>
        {:else if edgeData.edge.data?.connectionType === 'switch-server'}
          <p>Статус: {edgeData.edge.data.status}</p>
        {/if}
      </Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
