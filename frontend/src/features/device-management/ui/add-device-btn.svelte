<script lang="ts">
import { Plus } from "@lucide/svelte";
import DeviceForm from "$features/device-management/ui/device-form.svelte";
import { Button } from "$shared/ui/button/index.js";
import * as Dialog from "$shared/ui/dialog/index.js";

let { open = $bindable() }: { open: boolean } = $props();
</script>

<Dialog.Root bind:open>
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
    <DeviceForm bind:dialogState={open} />
  </Dialog.Content>
</Dialog.Root>
