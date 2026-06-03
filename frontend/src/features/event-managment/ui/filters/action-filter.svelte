<script lang="ts">
import { Check } from "@lucide/svelte";
import type { Column } from "@tanstack/table-core";
import type { Event } from "common/schemas/event/index";
import EventActionCell from "$entities/event/ui/action-cell.svelte";
import { Separator } from "$shared/ui/separator/index.js";

let {
  column,
}: {
  column: Column<Event, unknown>;
} = $props();

const allActions: Array<"create" | "update" | "delete"> = [
  "create",
  "update",
  "delete",
];

let selectedActions = $derived<string[]>(
  (column.getFilterValue() as string[]) ?? [],
);

let selectedList = $derived(
  allActions.filter((action) => selectedActions.includes(action)),
);
let availableList = $derived(
  allActions.filter((action) => !selectedActions.includes(action)),
);

function toggleAction(action: string) {
  if (selectedActions.includes(action)) {
    selectedActions = selectedActions.filter((a) => a !== action);
  } else {
    selectedActions = [...selectedActions, action];
  }

  if (selectedActions.length === 0) {
    column.setFilterValue(undefined);
  } else {
    column.setFilterValue(selectedActions);
  }
}
</script>

<div class="flex flex-col gap-4">
  {#if selectedList.length > 0}
    <div class="space-y-2">
      <p
        class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
      >
        Выбранные
      </p>
      <div class="flex flex-col gap-1">
        {#each selectedList as action}
          <EventActionCell {action} onclick={() => toggleAction(action)} />
        {/each}
      </div>
    </div>
    <Separator />
  {/if}

  <div class="space-y-2">
    {#if selectedList.length > 0}
      <p
        class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
      >
        Доступные
      </p>
    {/if}
    {#if availableList.length > 0}
      <div class="flex  gap-1">
        {#each availableList as action}
          <EventActionCell {action} onclick={() => toggleAction(action)} />
        {/each}
      </div>
    {:else}
      <p class="text-xs text-muted-foreground italic">Все действия выбраны.</p>
    {/if}
  </div>
</div>
