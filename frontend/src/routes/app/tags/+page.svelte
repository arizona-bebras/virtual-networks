<script lang="ts">
import {
  Briefcase,
  Database,
  Globe,
  Laptop,
  Plus,
  Server,
  Shield,
  Tag as TagIcon,
} from "lucide-svelte";
import DataTable from "$lib/components/table/data-table.svelte";
import { Button } from "$lib/components/ui/button/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { withRowActions } from "$lib/utils/table";
import { columns, type Tag } from "./columns.js";

// Initial mock data
const initialTags: Tag[] = [
  { id: "1", name: "Servers", icon: Server, color: "blue", count: 12 },
  { id: "2", name: "IT", icon: Briefcase, color: "green", count: 5 },
  { id: "3", name: "Laptop", icon: Laptop, color: "orange", count: 8 },
  { id: "4", name: "Production", icon: Database, color: "red", count: 15 },
  { id: "5", name: "Web", icon: Globe, color: "purple", count: 10 },
  { id: "6", name: "Security", icon: Shield, color: "yellow", count: 3 },
];

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
  tags = tags.filter((t) => t.id !== id);
}

function removeSelected(ids: string[]) {
  tags = tags.filter((t) => !ids.includes(t.id));
}

const tableColumns = $derived(withRowActions(columns, removeTag));
</script>

<div class="p-8">
  <div class="flex items-center justify-between mb-8">
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
                  class={`size-6 rounded-full ${color.value} hover:ring-2 ring-primary ring-offset-2 ring-offset-background transition-all ${newTagData.color === color.key ? 'ring-2 ring-primary ring-offset-2' : ''}`}
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
