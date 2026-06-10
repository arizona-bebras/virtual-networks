<script lang="ts">
import { createQuery, useQueryClient } from "@tanstack/svelte-query";
import type { ColumnFiltersState, Table } from "@tanstack/table-core";
import type { PeerState } from "common/schemas/device/peer-state";
import { Debounced } from "runed";
import Header from "$entities/table-page/ui/Header.svelte";
import {
  columns,
  type DeviceWithStatus,
} from "$features/device-management/model/device-table-columns.js";
import DeviceDialog from "$features/device-management/ui/device-dialog.svelte";
import SearchParamsHandler from "$features/device-management/ui/device-param-handler.svelte";
import { queryKeys } from "$shared/api/query-keys";
import { getNetworkId } from "$shared/lib/network-id-context";
import DataTable from "$shared/ui/data-table/data-table.svelte";
import { deviceQuery } from "../api/query";

let isAddDeviceDialogOpen = $state(false);

let currentNetworkId = $derived(getNetworkId().id);
let globalFilter = $state("");
const debounced = new Debounced(() => globalFilter, 500);
let columnFilters = $state<ColumnFiltersState>([]);
let selectedIds = $state<string[]>([]);
let table = $state<Table<DeviceWithStatus>>();

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

const queryClient = useQueryClient();

const userDevices = createQuery(() =>
  deviceQuery.userDevices({
    networkId: currentNetworkId,
    q: debounced.current,
    tags: tagsFilter,
    owner_id: onwerFilter,
  }),
);

// TODO: в ожидании реализации bulk delete на бэке
// biome-ignore lint/correctness/noUnusedVariables: <waiting for implementation>
function bulkRemoveSelected() {
  console.log("Delete devices:", selectedIds);
  selectedIds = [];
}

const tableData = $derived(
  userDevices.data?.map((device) => ({
    ...device,
    status: queryClient.getQueryData<PeerState>(
      queryKeys.networkDeviceStatus(currentNetworkId, device.id),
    ),
  })) ?? [],
);
</script>

<div class="p-2.5">
  <Header
    title="Устройства"
    description="Управляйте своими устройствами в сети"
    bind:globalFilter
    {selectedIds}
    {table}
  />

  <DeviceDialog
    bind:open={isAddDeviceDialogOpen}
    title="Создание устройства"
    description="Заполните все необходимые поля, чтобы добавить новое устройство в сеть"
  />

  <SearchParamsHandler devices={userDevices.data} bind:globalFilter />

  <DataTable
    {columns}
    data={tableData}
    bind:selectedIds
    bind:table
    onColumnFiltersChange={(filters) => (columnFilters = filters)}
  />
</div>
