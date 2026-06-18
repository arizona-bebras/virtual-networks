<script lang="ts">
import { type CalendarDate, getLocalTimeZone } from "@internationalized/date";
import { createQuery } from "@tanstack/svelte-query";
import type { ColumnFiltersState, Table } from "@tanstack/table-core";
import type { Event } from "common/schemas/event/index";
import { Debounced } from "runed";
import Header from "$entities/table-page/ui/Header.svelte";
import type { FilterValueWithId } from "$features/device-management/model/types";
import { eventQuery } from "$features/event-managment/api/query";
import { columns } from "$features/event-managment/model/event-table-columns";
import { getNetworkId } from "$shared/lib/network-id-context";
import DataTable from "$shared/ui/data-table/data-table.svelte";

type EventAction = Event["action"]["type"];
type EventEntityType = Event["entity"]["type"];
type DateFilterValue = {
  start: CalendarDate;
  end: CalendarDate;
};
type TimeFilterValue = {
  start: Date;
  end: Date;
};

const dateToIso = (date: CalendarDate | undefined) =>
  date?.toDate(getLocalTimeZone()).toISOString();

const dateToExclusiveEndIso = (date: CalendarDate | undefined) =>
  date?.add({ days: 1 }).toDate(getLocalTimeZone()).toISOString();

const eventMatchesSearch = (event: Event, search: string) => {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  return [
    event.user?.name,
    event.user?.email,
    event.action.type,
    event.entity.type,
    JSON.stringify(event.entity.info),
  ]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(normalizedSearch));
};

const eventMatchesDate = (
  event: Event,
  dateFilter: DateFilterValue | undefined,
) => {
  if (!dateFilter) {
    return true;
  }

  const eventTime = new Date(event.time).getTime();
  const start = dateFilter.start.toDate(getLocalTimeZone()).getTime();
  const end = dateFilter.end
    .add({ days: 1 })
    .toDate(getLocalTimeZone())
    .getTime();

  return eventTime >= start && eventTime < end;
};

const minutesFromDate = (date: Date) =>
  date.getHours() * 60 + date.getMinutes();

const eventMatchesTime = (
  event: Event,
  timeFilter: TimeFilterValue | undefined,
) => {
  if (!timeFilter) {
    return true;
  }

  const eventTime = new Date(event.time);
  const eventMinutes = minutesFromDate(eventTime);
  const start = minutesFromDate(timeFilter.start);
  const end = minutesFromDate(timeFilter.end);

  if (start <= end) {
    return eventMinutes >= start && eventMinutes <= end;
  }

  return eventMinutes >= start || eventMinutes <= end;
};

let globalFilter = $state("");
const debounced = new Debounced(() => globalFilter, 500);
let columnFilters = $state<ColumnFiltersState>([]);
let selectedIds = $state<string[]>([]);
let table = $state<Table<Event>>();
const currentNetworkId = $derived(getNetworkId().id);

const userFilter = $derived(
  columnFilters.find((filter) => filter.id === "user")?.value as
    | FilterValueWithId
    | undefined,
);

const actionFilter = $derived(
  columnFilters.find((filter) => filter.id === "action")?.value as
    | EventAction[]
    | undefined,
);

const entityFilter = $derived(
  columnFilters.find((filter) => filter.id === "entity")?.value as
    | EventEntityType[]
    | undefined,
);

const dateFilter = $derived(
  columnFilters.find((filter) => filter.id === "date")?.value as
    | DateFilterValue
    | undefined,
);

const timeFilter = $derived(
  columnFilters.find((filter) => filter.id === "time")?.value as
    | TimeFilterValue
    | undefined,
);

const serverActionFilter = $derived(
  actionFilter?.length === 1 ? actionFilter[0] : undefined,
);

const serverEntityFilter = $derived(
  entityFilter?.length === 1 ? entityFilter[0] : undefined,
);

const eventsQuery = createQuery(() =>
  eventQuery.networkEvents({
    networkId: currentNetworkId,
    userId: userFilter?.id,
    action: serverActionFilter,
    entity: serverEntityFilter,
    eventEarliestDate: dateToIso(dateFilter?.start),
    eventLatestDate: dateToExclusiveEndIso(dateFilter?.end),
  }),
);

const tableData = $derived(
  (eventsQuery.data ?? [])
    .filter((event) => {
      const matchesAction =
        !actionFilter?.length || actionFilter.includes(event.action.type);
      const matchesEntity =
        !entityFilter?.length || entityFilter.includes(event.entity.type);

      return (
        matchesAction &&
        matchesEntity &&
        (!userFilter || event.user?.id === userFilter.id) &&
        eventMatchesDate(event, dateFilter) &&
        eventMatchesTime(event, timeFilter) &&
        eventMatchesSearch(event, debounced.current)
      );
    })
    .sort(
      (eventA, eventB) =>
        new Date(eventB.time).getTime() - new Date(eventA.time).getTime(),
    ),
);

// TODO: в ожидании реализации bulk delete на бэке
// biome-ignore lint/correctness/noUnusedVariables: <waiting for implementation>
function bulkRemoveSelected() {
  console.log("Delete events:", selectedIds);
  selectedIds = [];
}
</script>

<div class="p-2.5">
  <Header
    title="События"
    description="Отслеживайте все изменения, произошедшие в сети"
    canCreate={false}
    bind:globalFilter
    {selectedIds}
    {table}
  />

  <DataTable
    {columns}
    data={tableData}
    bind:selectedIds
    bind:table
    onColumnFiltersChange={(filters) => (columnFilters = filters)}
  />
</div>
