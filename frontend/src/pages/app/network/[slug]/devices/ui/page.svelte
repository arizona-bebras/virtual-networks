<script lang="ts">
import { Plus, Search, Trash } from "@lucide/svelte";
import { createQuery } from "@tanstack/svelte-query";
import type { ColumnFiltersState, Table } from "@tanstack/table-core";
import { Debounced } from "runed";
import { fade } from "svelte/transition";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { columns } from "$features/device-management/model/device-table-columns.js";
import BreadCrumb from "$features/device-management/ui/breadcrumb.svelte";
import DeviceDialog from "$features/device-management/ui/device-dialog.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import * as Card from "$shared/ui/card/index.js";
import DataTable from "$shared/ui/data-table/data-table.svelte";
import DataTableFilters from "$shared/ui/data-table/data-table-filters.svelte";
import { Input } from "$shared/ui/input/index.js";
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
  <div
    class="pl-6 mt-2.5 py-4 mb-8 flex flex-col justify-between bg-background border rounded-tl-lg"
  >
    <BreadCrumb />
    <div
      class="mt-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Devices</h1>
        <p class="text-muted-foreground">
          Уравляйте и отслеживайте свои устройства в сети.
        </p>
      </div>
    </div>
    <div class="flex justify-between gap-2 pr-6 mb-3">
      <div class="w-lg relative">
        <Input
          placeholder="Поиск по имени..."
          bind:value={globalFilter}
          class="w-full placeholder:text-[14px] mb-0 px-8.5 font-semibold"
        />
        <Search class="absolute top-1/2 ml-2 -translate-y-1/2 size-4.5 stroke-3" />
      </div>

      {#if selectedIds.length > 0}
        <div in:fade={{ duration: 150 }}>
          <Button
            variant="destructive"
            size="sm"
            class="h-10 gap-1"
            onclick={bulkRemoveSelected}
          >
            <Trash class="size-4" />
            Delete ({selectedIds.length}
            )
          </Button>
        </div>
      {/if}
      <Button
        onclick={() => (isAddDeviceDialogOpen = true)}
        class="rounded-[6px]"
      >
        Добавить устройство
        <Plus class="mr-1 size-3" />
      </Button>
    </div>
    <div class=""><DataTableFilters {table} /></div>
  </div>

  <DeviceDialog
    bind:open={isAddDeviceDialogOpen}
    title="Add Device"
    description="Register a new device to your virtual network."
  />

  <DeviceDialog
    bind:open={isEditingDialogOpen}
    title="Edit Device"
    device={editingDevice}
    description="Update the details for your device."
  />

  <Card.Root>
    <Card.Content class="p-6">
      <DataTable
        {columns}
        data={userDevices.data || []}
        bind:selectedIds
        bind:table
        onColumnFiltersChange={(filters) => (columnFilters = filters)}
      />
    </Card.Content>
  </Card.Root>
</div>
