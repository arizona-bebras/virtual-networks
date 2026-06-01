<script lang="ts">
import type { Column } from "@tanstack/table-core";
import type { Event } from "common/schemas/event/index";
import TimePicker from "$shared/ui/time-picker/time-picker.svelte";

let {
  column,
  open = $bindable(),
}: {
  column: Column<Event, unknown>;
  open: boolean;
} = $props();

const filterValue = $derived(
  column.getFilterValue() as { start: Date; end: Date } | undefined,
);
let startDemo = new Date();
startDemo.setHours(10, 50, 0, 0);

let endDemo = new Date();
endDemo.setHours(12, 30, 0, 0);

let range = $derived({
  start: filterValue?.start ?? startDemo,
  end: filterValue?.end ?? endDemo,
});

function handleSave(newRange: { start: Date; end: Date }) {
  column.setFilterValue(newRange);
  open = false;
}
</script>

<TimePicker isRange={true} bind:range onSave={handleSave} />
