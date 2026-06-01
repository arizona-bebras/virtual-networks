<script lang="ts">
import type { Column } from "@tanstack/table-core";
import type { Event } from "common/schemas/event/index";
import TimePicker from "$shared/ui/time-picker/time-picker.svelte";

let {
  column,
}: {
  column: Column<Event, unknown>;
} = $props();

// Инициализируем демо-диапазон: 10:50 - 12:30
let startDemo = new Date();
startDemo.setHours(10, 50, 0, 0);

let endDemo = new Date();
endDemo.setHours(12, 30, 0, 0);

let range = $state({
  start: startDemo,
  end: endDemo,
});

function handleSave(newRange: { start: Date; end: Date }) {
  // Передаем выбранный диапазон в фильтр колонки таблицы
  column.setFilterValue(newRange);
}

$inspect(range);
</script>

<TimePicker isRange={true} bind:range onSave={handleSave} />
