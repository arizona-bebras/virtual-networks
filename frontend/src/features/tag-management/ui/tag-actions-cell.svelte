<script lang="ts">
import { MoreHorizontal, Trash } from "@lucide/svelte";
import { Button } from "$shared/ui/button/index.js";
import * as DropdownMenu from "$shared/ui/dropdown-menu/index.js";

let { id, onDelete }: { id: string; onDelete?: () => void } = $props();
</script>

<div class="text-right">
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      <Button variant="ghost" size="icon">
        <MoreHorizontal class="size-4" />
      </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end">
      <DropdownMenu.Item>Edit Tag</DropdownMenu.Item>
      {#if onDelete}
        <DropdownMenu.Item class="text-destructive" onclick={onDelete}>
          <Trash class="mr-2 size-4" />
          Delete Tag
        </DropdownMenu.Item>
      {/if}
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>
