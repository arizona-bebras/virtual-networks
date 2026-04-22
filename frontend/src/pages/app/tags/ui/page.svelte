<script lang="ts">
import { Plus } from "@lucide/svelte";
import { initialTags } from "$entities/tag/model/mock-tags.js";
import type { Tag } from "$entities/tag/model/types.js";
import { columns } from "$features/tag-management/model/tag-table-columns.js";
import AddTagBtn from "$features/tag-management/ui/add-tag-btn.svelte";
import { withRowActions } from "$shared/lib/table/with-row-actions";
import { Button } from "$shared/ui/button/index.js";
import * as Card from "$shared/ui/card/index.js";
import DataTable from "$shared/ui/data-table/data-table.svelte";
import * as Dialog from "$shared/ui/dialog/index.js";
import { Input } from "$shared/ui/input/index.js";
import { Label } from "$shared/ui/label/index.js";

let tags = $state<Tag[]>(initialTags);
let isDialogOpen = $state(false);
let newTagData = $state({ name: "", color: "blue", icon: "Tag" });

const colors = [
  { name: "Blue", value: "bg-blue-500", key: "blue" },
  { name: "Green", value: "bg-green-500", key: "green" },
  { name: "Red", value: "bg-red-500", key: "red" },
  { name: "Orange", value: "bg-orange-500", key: "orange" },
  { name: "Purple", value: "bg-purple-500", key: "purple" },
  { name: "Yellow", value: "bg-yellow-500", key: "yellow" },
];

// function addTag() {
//   if (!newTagData.name) return;

//   const tag: Tag = {
//     id: Math.random().toString(36).substring(2, 9),
//     name: newTagData.name,
//     icon: TagIcon,
//     color: newTagData.color,
//     count: 0,
//   };

//   tags = [...tags, tag];
//   newTagData = { name: "", color: "blue", icon: "Tag" };
//   isDialogOpen = false;
// }

function removeTag(id: string) {
  tags = tags.filter((tag) => tag.id !== id);
}

function removeSelected(ids: string[]) {
  tags = tags.filter((tag) => !ids.includes(tag.id));
}

const tableColumns = $derived(withRowActions(columns, removeTag));
</script>

<div class="p-8">
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Tags</h1>
      <p class="text-muted-foreground">Organize your devices using tags.</p>
    </div>
    <AddTagBtn bind:open={isDialogOpen} />
  </div>

  <Card.Root>
    <Card.Content class="p-6">
      <DataTable
        columns={tableColumns}
        data={tags}
        onDeleteSelected={removeSelected}
      />
    </Card.Content>
  </Card.Root>
</div>
