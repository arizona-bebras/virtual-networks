<script lang="ts">
import {
  type CalendarDate,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
import type { Column } from "@tanstack/table-core";
import type { Event } from "common/schemas/event/index";
import { onMount, untrack } from "svelte";
import { Button } from "$shared/ui/button/index";
import * as Popover from "$shared/ui/popover/index.js";
import { RangeCalendar } from "$shared/ui/range-calendar/index";

let { column }: { column: Column<Event, unknown> } = $props();

// svelte-ignore state_referenced_locally
let filterValue = column.getFilterValue() as
  | {
      start: CalendarDate;
      end: CalendarDate;
    }
  | undefined;

let value = $state({
  start: filterValue?.start ?? today(getLocalTimeZone()),
  end: filterValue?.end ?? today(getLocalTimeZone()).add({ days: 7 }),
});

// $effect(() => {
//   if (value) {
//     untrack(() => (value = column.getFilterValue()));
//   }
// });
</script>

<RangeCalendar bind:value />
<Button
  class="bg-secondary text-secondary-foreground text-[10px] font-black uppercase tracking-widest px-4 rounded-[6px] shadow-lg hover:shadow-secondary/20 transition-all active:scale-95"
  onclick={() => column.setFilterValue(value)}
>
  Применить
</Button>
