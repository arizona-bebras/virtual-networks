<script lang="ts">
import { Filter } from "@lucide/svelte";
import type { Column } from "@tanstack/table-core";
import { Button } from "$shared/ui/button/index.js";
import * as Popover from "$shared/ui/popover/index.js";
import { Input } from "$shared/ui/input/index.js";

let { column, label }: { column: Column<any, any>; label: string } = $props();

let filterValue = $state((column.getFilterValue() as string) ?? "");

function handleInput(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  filterValue = value;
  column.setFilterValue(value || undefined);
}
</script>

<div class="flex items-center gap-1">
  <span class="text-sm font-medium">{label}</span>

  <Popover.Root>
    <Popover.Trigger>
      <Button 
        variant="ghost" 
        size="icon" 
        class="h-8 w-8 {filterValue ? 'text-primary' : 'text-muted-foreground'}"
      >
        <Filter class="h-3.5 w-3.5" />
      </Button>
    </Popover.Trigger>
    <Popover.Content class="w-64 p-4" align="start">
      <div class="space-y-2">
        <h4 class="font-medium leading-none">Filter by {label}</h4>
        <p class="text-sm text-muted-foreground">
          Type a tag name to filter devices.
        </p>
        <Input
          placeholder="Tag name..."
          value={filterValue}
          oninput={handleInput}
          class="h-8"
        />
      </div>
    </Popover.Content>
  </Popover.Root>
</div>
