<script lang="ts">
import { Plus, Tag as TagIcon } from "@lucide/svelte";
import { initialTags } from "$entities/tag/model/mock-tags.js";
import type { Tag } from "$entities/tag/model/types.js";
import { columns } from "$features/tag-management/model/tag-table-columns.js";
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

function addTag() {
  if (!newTagData.name) return;

  const tag: Tag = {
    id: Math.random().toString(36).substring(2, 9),
    name: newTagData.name,
    icon: TagIcon,
    color: newTagData.color,
    count: 0,
  };

  tags = [...tags, tag];
  newTagData = { name: "", color: "blue", icon: "Tag" };
  isDialogOpen = false;
}

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
    <Dialog.Root bind:open={isDialogOpen}>
      <Dialog.Trigger>
        <Button>
          <Plus class="mr-2 size-4" />
          Add Tag
        </Button>
      </Dialog.Trigger>
      <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
          <Dialog.Title>Add Tag</Dialog.Title>
          <Dialog.Description>
            Create a new tag to group your devices.
          </Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-2 py-4">
          <div class="grid gap-1">
            <Label for="name">Name</Label>
            <Input
              id="name"
              bind:value={newTagData.name}
              placeholder="e.g. Servers"
            />
          </div>
          <div class="grid gap-1">
            <Label>Color</Label>
            <div class="flex gap-2">
              {#each colors as color}
                <button
                  type="button"
                  class={`size-6 rounded-full ${color.value} ring-primary ring-offset-2 ring-offset-background transition-all hover:ring-2 ${newTagData.color === color.key ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  title={color.name}
                  onclick={() => newTagData.color = color.key}
                ></button>
              {/each}
            </div>
          </div>
          <div class="grid gap-1">
            <Label for="icon">Icon Name</Label>
            <Input
              id="icon"
              bind:value={newTagData.icon}
              placeholder="e.g. Server, Database"
            />
          </div>
        </div>
        <Dialog.Footer>
          <Button type="button" onclick={addTag}>Save Tag</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
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
