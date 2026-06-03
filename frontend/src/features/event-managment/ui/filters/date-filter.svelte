<script lang="ts">
import { getLocalTimeZone, today } from "@internationalized/date";
import type { Column } from "@tanstack/table-core";
import type { Event } from "common/schemas/event/index";
import { untrack } from "svelte";
import * as Popover from "$shared/ui/popover/index.js";
import { RangeCalendar } from "$shared/ui/range-calendar/index";

let { column }: { column: Column<Event, unknown> } = $props();

const start = today(getLocalTimeZone());
const end = start.add({ days: 7 });

let value = $state({
  start,
  end,
});

$effect(() => {
  if (value) {
    untrack(() => column.setFilterValue(value));
  }
});
</script>

<RangeCalendar bind:value />
