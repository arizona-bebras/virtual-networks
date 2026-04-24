<script lang="ts">
import { createQuery } from "@tanstack/svelte-query";
import { columns } from "$features/tag-management/model/tag-table-columns.js";
import AddTagBtn from "$features/tag-management/ui/add-tag-btn.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import * as Card from "$shared/ui/card/index.js";
import DataTable from "$shared/ui/data-table/data-table.svelte";
import { deviceTags } from "../api/query";

let isDialogOpen = $state(false);
let currentNetworkId = $derived(getNetworkId().id);

// TODO: в ожидании реализации bulk delete на бэке
function bulkRemoveSelected(_ids: string[]) {}

// const tableColumns = $derived(withRowActions(columns, removeTag));

const userTags = createQuery(() => deviceTags.userTags(currentNetworkId));
</script>

<div class="p-8">
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Tags</h1>
      <p class="text-muted-foreground">Organize your devices using tags.</p>
    </div>
    <AddTagBtn bind:open={isDialogOpen} />
  </div>

  {#if userTags.isSuccess}
    <Card.Root>
      <Card.Content class="p-6">
        <DataTable
          {columns}
          data={userTags.data! || []}
          onDeleteSelected={bulkRemoveSelected}
        />
      </Card.Content>
    </Card.Root>
  {/if}
</div>
