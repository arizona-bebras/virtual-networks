<script lang="ts">
import { createQuery } from "@tanstack/svelte-query";
import type { ColumnFiltersState, Table } from "@tanstack/table-core";
import { Debounced } from "runed";

import { goto } from "$app/navigation";
import { page } from "$app/state";
import Header from "$entities/table-page/ui/Header.svelte";
import { columns } from "$features/device-management/model/device-table-columns.js";

import DeviceDialog from "$features/device-management/ui/device-dialog.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";

import DataTable from "$shared/ui/data-table/data-table.svelte";

import { deviceQuery } from "../api/query";

let isAddDeviceDialogOpen = $state(false);
let isEditingDialogOpen = $state(false);

let currentNetworkId = $derived(getNetworkId().id);
let globalFilter = $state("");
const debounced = new Debounced(() => globalFilter, 500);
let columnFilters = $state<ColumnFiltersState>([]);
let selectedIds = $state<string[]>([]);
let table = $state<Table<any>>();

let tagsFilter = $derived(
  (
    columnFilters.find((f) => f.id === "tags")?.value as
      | { id: string; name: string }[]
      | undefined
  )?.map((t) => t.id),
);
let onwerFilter = $derived(
  columnFilters.find((f) => f.id === "owner")?.value as string | undefined,
);

const userDevices = createQuery(() =>
  deviceQuery.userDevices({
    networkId: currentNetworkId,
    q: debounced.current,
    tags: tagsFilter,
    owner_id: onwerFilter,
  }),
);

let deviceIdSearchParam = $derived(page.url.searchParams.get("editDevice"));
let editingDevice = $derived(
  userDevices.data?.find((d) => d.id === deviceIdSearchParam),
);

$effect(() => {
  if (deviceIdSearchParam) {
    isEditingDialogOpen = true;
  }
});

$effect(() => {
  if (!isEditingDialogOpen && deviceIdSearchParam) {
    const newUrl = new URL(page.url);
    newUrl.searchParams.delete("editDevice");
    goto(newUrl, { replaceState: true, keepFocus: true });
  }
});

// TODO: в ожидании реализации bulk delete на бэке
function bulkRemoveSelected() {
  console.log("Delete devices:", selectedIds);
  selectedIds = [];
}
</script>

<div class="">
  <Header
    title="Device"
    description="Уравляйте и отслеживайте свои устройства в сети."
    bind:globalFilter
    {selectedIds}
    {table}
  />

  <DeviceDialog
    bind:open={isAddDeviceDialogOpen}
    title="Создание устройства"
    description="Заполните все необходимые поля, чтобы добавить новое устройство в сеть"
  />

  <DeviceDialog
    bind:open={isEditingDialogOpen}
    title="Редактирование устройства"
    device={editingDevice}
    description="Измените параметры своего устройства"
  />

  <DataTable
    {columns}
    data={userDevices.data || []}
    bind:selectedIds
    bind:table
    onColumnFiltersChange={(filters) => (columnFilters = filters)}
  />
</div>
