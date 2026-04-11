<script lang="ts">
import * as Sheet from "$lib/components/ui/sheet/index.js";

let {
  open = $bindable(),
  nodes = $bindable(),
}: {
  open: boolean;
  nodes: {
    id: string;
    position: { x: number; y: number };
    data: { label: string };
    [key: string]: unknown;
  }[];
} = $props();
</script>

<Sheet.Root bind:open>
  <Sheet.Content>
    <Sheet.Header>
      <button
        type="button"
        onclick={() => {
					const serverCont = nodes.filter((obj) => obj.id.startsWith('server')).length;
					nodes = [
						...nodes,
						{
							id: `server-${serverCont + 1}`,
							position: { x: Math.random() * 400, y: Math.random() * 400 },
							data: { label: `Сервер ${serverCont + 1}` }
						}
					];
					open = false;
				}}
      >
        Сервер
      </button>
      <button
        type="button"
        onclick={() => {
					const clientCont = nodes.filter((obj) => obj.id.startsWith('client')).length;
					nodes = [
						...nodes,
						{
							id: `client-${clientCont + 1}`,
							type: 'clientNode',
							position: { x: Math.random() * 400, y: Math.random() * 400 },
							data: { label: `Клиент ${clientCont + 1}` }
						}
					];
					open = false;
				}}
      >
        Клиент
      </button>
      <button
        type="button"
        onclick={() => {
					const switchCont = nodes.filter((obj) => obj.id.startsWith('switch')).length;
					nodes = [
						...nodes,
						{
							id: `switch-${switchCont + 1}`,
							type: 'switchNode',
							position: { x: Math.random() * 400, y: Math.random() * 400 },
							data: { label: `Коммутатор ${switchCont + 1}` }
						}
					];
					open = false;
				}}
      >
        Коммутатор
      </button>
    </Sheet.Header>
  </Sheet.Content>
</Sheet.Root>
