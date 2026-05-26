<script lang="ts">
import { SquarePen } from "@lucide/svelte";
import { goto } from "$app/navigation";
import { page } from "$app/state";

let { redirectLink }: { redirectLink: string } = $props();

function handleEdit(e: MouseEvent) {
  e.stopPropagation();
  goto(redirectLink);
}
</script>

<button
  type="button"
  class="opacity-0 group-hover:opacity-100 trasition-nall p-1 rounded-md"
  onclick={handleEdit}
  title="Редактировать"
>
  <SquarePen size={12} class="text-muted-foreground" />
</button>
