<script lang="ts">
import { page } from "$app/state";
import { Button } from "$lib/components/ui/button/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Separator } from "$lib/components/ui/separator/index.js";

const networkId = page.params.id;

// Mock network data.
const network = {
  id: networkId,
  name: "Default Network",
  cidr: "10.0.0.0/24",
  createdAt: "2024-04-09",
};
</script>

<div class="p-8 max-w-2xl mx-auto">
  <div class="mb-8">
    <h1 class="text-3xl font-bold tracking-tight">Network Configuration</h1>
    <p class="text-muted-foreground">
      Configure your virtual network settings.
    </p>
  </div>

  <Card.Root>
    <Card.Header>
      <Card.Title>General Settings</Card.Title>
      <Card.Description>
        Update your network name and address space.
      </Card.Description>
    </Card.Header>
    <Card.Content class="space-y-6">
      <div class="space-y-2">
        <Label for="name">Network Name</Label>
        <Input id="name" bind:value={network.name} />
      </div>
      <div class="space-y-2">
        <Label for="cidr">Network CIDR</Label>
        <Input id="cidr" bind:value={network.cidr} />
        <p class="text-[12px] text-muted-foreground">
          The IP range for this network (e.g. 10.0.0.0/24).
        </p>
      </div>
      <Separator />
      <div class="flex flex-col gap-1">
        <span class="text-sm font-medium">Network ID</span>
        <span
          class="text-xs font-mono text-muted-foreground bg-muted p-2 rounded"
        >
          {networkId}
        </span>
      </div>
    </Card.Content>
    <Card.Footer class="flex justify-between border-t p-6">
      <Button variant="outline">Cancel</Button>
      <Button>Save Changes</Button>
    </Card.Footer>
  </Card.Root>

  <div class="mt-8">
    <Card.Root class="border-destructive/20 bg-destructive/5">
      <Card.Header>
        <Card.Title class="text-destructive">Danger Zone</Card.Title>
        <Card.Description>
          Permanently delete this network and all associated data.
        </Card.Description>
      </Card.Header>
      <Card.Footer>
        <Button variant="destructive">Delete Network</Button>
      </Card.Footer>
    </Card.Root>
  </div>
</div>
