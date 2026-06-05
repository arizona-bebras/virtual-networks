<script lang="ts" generics="TData">
import {
  type CalendarDate,
  DateFormatter,
  getLocalTimeZone,
} from "@internationalized/date";
import { X } from "@lucide/svelte";
import type { Table } from "@tanstack/table-core";
import { fade } from "svelte/transition";
import EventActionCell from "$entities/event/ui/action-cell.svelte";
import EntityBadge from "$entities/event/ui/entity-badge.svelte";
import TagBadge from "$entities/tag/ui/tag-badge.svelte";
import EntityCell from "$features/event-managment/ui/event-entity-cell.svelte";
import { Badge } from "$shared/ui/badge/index.js";
import { Button } from "$shared/ui/button/index.js";

type Props<TData> = {
  table: Table<TData> | undefined;
};

let { table }: Props<TData> = $props();

const columnFilters = $derived(table?.getState().columnFilters ?? []);

const df = new DateFormatter("ru-RU", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(date: CalendarDate | undefined, tz: string) {
  if (!date) return "";
  return df.format(date.toDate(tz)).replace(/\sг\.$/, "");
}

function getFilterLabel(columnName: string, value: unknown): string {
  if (typeof value === "object" && value !== null) {
    if (columnName === "date") {
      const { start, end } = value as {
        start: CalendarDate | undefined;
        end: CalendarDate | undefined;
      };

      if (!start && !end) return "За всё время";

      const tz = getLocalTimeZone();
      const startStr = formatDate(start, tz);
      const endStr = formatDate(end, tz);

      if (startStr && !endStr) return startStr;
      if (!startStr && endStr) return `До ${endStr}`;
      if (startStr === endStr) return startStr;

      return `${startStr} — ${endStr}`;
    } else if (columnName === "time") {
      const { start, end } = value as {
        start: Date | undefined;
        end: Date | undefined;
      };

      if (!start && !end) return "За всё время";

      const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const startStr = start ? timeFormatter.format(start) : "";
      const endStr = end ? timeFormatter.format(end) : "";

      if (startStr && !endStr) return `С ${startStr}`;
      if (!startStr && endStr) return `До ${endStr}`;
      if (startStr === endStr) return startStr;

      return `${startStr} — ${endStr}`;
    } else return String((value as { name: unknown }).name);
  }
  return String(value);
}
</script>

{#if table && columnFilters.length > 0}
  <div class="flex flex-wrap gap-2 py-2" in:fade>
    {#each columnFilters as filter (filter.id)}
      {@const column = table.getColumn(filter.id)}
      {@const Icon = column?.columnDef.meta?.icon}
      {console.log(filter.id, filter.value)}
      <!-- Обработка тегов и массива фильтров -->
      {#if Array.isArray(filter.value)}
        {#each filter.value as value}
          {#if filter.id === "action"}
            <EventActionCell action={value} />
          {:else if filter.id === "entities"}
            <EntityBadge
              entityType={value}
              // onclick={() => {
              //   const newValue = (filter.value as string[]).filter((v) => v !== value);
              //   column?.setFilterValue(newValue.length > 0 ? newValue : undefined);
              // }}
            />
          {:else}
            {#each filter.value as value}
              <TagBadge tag={value} isIcon={true} />
            {/each}
          {/if}
        {/each}
      <!-- <button
              type="button"
              class="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onclick={() => {
                  const newValue = (filter.value as string[]).filter((v) => v !== value);
                  column?.setFilterValue(newValue.length > 0 ? newValue : undefined);
                }}
            >
              <X class="size-3 text-muted-foreground hover:text-foreground" />
              <span class="sr-only">Удалить фильтр</span>
            </button> -->
      {:else}
        <Badge
          variant="secondary"
          class="h-7 gap-1 px-2 font-normal border border-border rounded-[4px] bg-primary text-muted-foreground"
        >
          {#if Icon}
            <Icon class="mr-1 size-3 text-muted-foreground stroke-3" />
          {/if}
          <span class="capitalize font-medium">
            {getFilterLabel(filter.id, filter.value)}
          </span>
          <button
            type="button"
            class="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onclick={() => column?.setFilterValue(undefined)}
          >
            <X class="size-3 text-muted-foreground hover:text-foreground" />
            <span class="sr-only">Удалить фильтр</span>
          </button>
        </Badge>
      {/if}
    {/each}
    <Button
      variant="ghost"
      size="sm"
      class="h-7 px-2 text-xs"
      onclick={() => table.resetColumnFilters()}
    >
      Очистить все
    </Button>
  </div>
{/if}
