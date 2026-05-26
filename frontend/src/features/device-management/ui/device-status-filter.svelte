<script lang="ts">
import { ArrowUpDown, Filter } from "@lucide/svelte";
import type { Column } from "@tanstack/table-core";
import type { DeviceRelations } from "common/schemas/device/index";
import { Button } from "$shared/ui/button/index.js";
import * as DropdownMenu from "$shared/ui/dropdown-menu/index.js";

let {
  column,
  label,
}: { column: Column<DeviceRelations, unknown>; label: string } = $props();

const filterValue = $derived(column.getFilterValue() as string | undefined);

function setFilter(value: string | undefined) {
  column.setFilterValue(value);
}
</script>

<div class="flex items-center gap-1">
  <Button
    variant="ghost"
    size="sm"
    class="-ml-3 h-8 gap-2 px-2"
    onclick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  >
    <span>{label}</span>
    <ArrowUpDown class="h-4 w-4" />
  </Button>

  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 {filterValue ? 'text-primary' : 'text-muted-foreground'}"
      >
        <Filter class="h-3.5 w-3.5" />
      </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="start">
      <DropdownMenu.Label>Фильтр по статусу</DropdownMenu.Label>
      <DropdownMenu.Separator />
      <DropdownMenu.CheckboxItem
        checked={filterValue === undefined}
        onCheckedChange={() => setFilter(undefined)}
      >
        Все
      </DropdownMenu.CheckboxItem>
      <DropdownMenu.CheckboxItem
        checked={filterValue === "online"}
        onCheckedChange={() => setFilter("online")}
      >
        В сети
      </DropdownMenu.CheckboxItem>
      <DropdownMenu.CheckboxItem
        checked={filterValue === "offline"}
        onCheckedChange={() => setFilter("offline")}
      >
        Не в сети
      </DropdownMenu.CheckboxItem>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>
