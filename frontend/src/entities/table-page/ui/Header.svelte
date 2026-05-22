<script lang="ts">
import { Plus, Search, Trash } from "@lucide/svelte";
import type { Table } from "@tanstack/table-core";
import { fade } from "svelte/transition";
import BreadCrumb from "$features/device-management/ui/BreadCrumb.svelte";
import RuleDialog from "$features/rule-management/ui/rule-dialog.svelte";
import { Button } from "$shared/ui/button/index";
import DataTableFilters from "$shared/ui/data-table/data-table-filters.svelte";
import { Input } from "$shared/ui/input/index";
  import DeviceDialog from "$features/device-management/ui/device-dialog.svelte";
  import { page } from "$app/state";
  import type { Device } from "$entities/device/model/types";

// * as

let {
  title,
  description,
  globalFilter = $bindable(),
  selectedIds,
  table,
}: {
  title: string;
  description: string;
  globalFilter: string;
  selectedIds: string[];
  table: Table<any> | undefined;
} = $props();

let isAddDialogOpen = $state(false);

let currentPage = $derived(page.url.pathname.split('/').at(-1))


function bulkRemoveSelected() {
  console.log("Delete rules:");
}
</script>

<div
  class="pl-6 py-4 mb-4 flex flex-col justify-between bg-background border rounded-bl-[4px]"
>
  <BreadCrumb />
  <div
    class="mt-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
  >
    <div>
      <h1 class="text-3xl font-bold tracking-tight">{title}</h1>
      <p class="text-muted-foreground text-[14px]">{description}</p>
    </div>
  </div>
  <div class="flex justify-between gap-2 pr-6 mb-3">
    <div class="w-lg relative">
      <Input
        placeholder="Поиск по имени..."
        bind:value={globalFilter}
        class="w-full placeholder:text-[12px] mb-0 px-8.5 font-semibold"
      />
      <Search class="absolute top-1/2 ml-2 -translate-y-1/2 size-4 stroke-3" />
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
    <Button onclick={() => (isAddDialogOpen = true)} class="rounded-[6px]">
      Добавить устройство
      <Plus class="mr-1 size-3" />
    </Button>
  </div>
  <div class=""><DataTableFilters {table} /></div>
</div>

{#if currentPage === 'devices'}
<DeviceDialog
  bind:open={isAddDialogOpen}
  title="Add Rule"
  description="Create a new network access control rule."
/>
{:else if currentPage === 'rules'}
<RuleDialog
  bind:open={isAddDialogOpen}
  title="Add Rule"
  description="Create a new network access control rule."
/>
{/if}
