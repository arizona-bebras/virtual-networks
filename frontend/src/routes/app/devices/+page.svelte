<script lang="ts">
import { Plus } from "lucide-svelte";
import DataTable from "$lib/components/table/data-table.svelte";
import { Button } from "$lib/components/ui/button/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { withRowActions } from "$lib/utils/table";
import { columns, type Device } from "./columns.js";

// Initial mock data
const initialDevices: Device[] = [
  {
    id: "1",
    name: "MacBook Pro",
    ip: "10.0.0.2",
    status: "online",
    tags: ["IT", "Laptop"],
  },
  {
    id: "2",
    name: "Database Server",
    ip: "10.0.0.5",
    status: "online",
    tags: ["Servers", "Production"],
  },
  {
    id: "3",
    name: "Web Server 01",
    ip: "10.0.0.10",
    status: "online",
    tags: ["Servers", "Web"],
  },
  {
    id: "4",
    name: "Backup Server",
    ip: "10.0.0.20",
    status: "offline",
    tags: ["Servers", "Backup"],
  },
];

let devices = $state<Device[]>(initialDevices);
let isDialogOpen = $state(false);
let newDeviceData = $state({ name: "", ip: "", tags: "" });

function addDevice() {
  if (!newDeviceData.name) return;

  const device: Device = {
    id: Math.random().toString(36).substring(2, 9),
    name: newDeviceData.name,
    ip: newDeviceData.ip || `10.0.0.${Math.floor(Math.random() * 254) + 1}`,
    status: "online",
    tags: newDeviceData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  };

  devices = [...devices, device];
  newDeviceData = { name: "", ip: "", tags: "" };
  isDialogOpen = false;
}

function removeDevice(id: string) {
  devices = devices.filter((d) => d.id !== id);
}

function removeSelected(ids: string[]) {
  devices = devices.filter((d) => !ids.includes(d.id));
}

const tableColumns = $derived(withRowActions(columns, removeDevice));
</script>

<div class="p-8">
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Devices</h1>
      <p class="text-muted-foreground">
        Manage and monitor your network devices.
      </p>
    </div>
    <Dialog.Root bind:open={isDialogOpen}>
      <Dialog.Trigger>
        <Button>
          <Plus class="mr-2 size-4" />
          Add Device
        </Button>
      </Dialog.Trigger>
      <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
          <Dialog.Title>Add Device</Dialog.Title>
          <Dialog.Description>
            Register a new device to your virtual network.
          </Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-2 py-4">
          <div class="grid gap-1">
            <Label for="name">Name</Label>
            <Input
              id="name"
              bind:value={newDeviceData.name}
              placeholder="My Device"
            />
          </div>
          <div class="grid gap-1">
            <Label for="ip">IP Address (Optional)</Label>
            <Input
              id="ip"
              bind:value={newDeviceData.ip}
              placeholder="10.0.0.x"
            />
          </div>
          <div class="grid gap-1">
            <Label for="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              bind:value={newDeviceData.tags}
              placeholder="servers, web, it"
            />
          </div>
        </div>
        <Dialog.Footer>
          <Button type="button" onclick={addDevice}>Save Device</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  </div>

  <Card.Root>
    <Card.Content class="p-6">
      <DataTable
        columns={tableColumns}
        data={devices}
        onDeleteSelected={removeSelected}
      />
    </Card.Content>
  </Card.Root>
</div>
