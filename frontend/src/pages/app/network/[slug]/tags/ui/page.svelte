<script lang="ts">
import { Plus } from "@lucide/svelte";
import { createQuery } from "@tanstack/svelte-query";
import { initialTags } from "$entities/tag/model/mock-tags.js";
import type { Tag } from "$entities/tag/model/types.js";
import { columns } from "$features/tag-management/model/tag-table-columns.js";
import AddTagBtn from "$features/tag-management/ui/add-tag-btn.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import { withRowActions } from "$shared/lib/table/with-row-actions";
import { Button } from "$shared/ui/button/index.js";
import * as Card from "$shared/ui/card/index.js";
import DataTable from "$shared/ui/data-table/data-table.svelte";
import * as Dialog from "$shared/ui/dialog/index.js";
import { Input } from "$shared/ui/input/index.js";
import { Label } from "$shared/ui/label/index.js";
import { deviceTags } from "../api/query";

let tags = $state<Tag[]>(initialTags);
let isDialogOpen = $state(false);
let newTagData = $state({ name: "", color: "blue", icon: "Tag" });
let currentNetworkId = $derived(getNetworkId().id);

const colors = [
  { name: "Blue", value: "bg-blue-500", key: "blue" },
  { name: "Green", value: "bg-green-500", key: "green" },
  { name: "Red", value: "bg-red-500", key: "red" },
  { name: "Orange", value: "bg-orange-500", key: "orange" },
  { name: "Purple", value: "bg-purple-500", key: "purple" },
  { name: "Yellow", value: "bg-yellow-500", key: "yellow" },
];


function removeTag(id: string) {
  tags = tags.filter((tag) => tag.id !== id);
}

function removeSelected(ids: string[]) {
  tags = tags.filter((tag) => !ids.includes(tag.id));
}

const tableColumns = $derived(withRowActions(columns, removeTag));

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
          columns={tableColumns}
          data={userTags.data! || []} 
          onDeleteSelected={removeSelected}
        />
      </Card.Content>
    </Card.Root>
  {/if}
</div>
