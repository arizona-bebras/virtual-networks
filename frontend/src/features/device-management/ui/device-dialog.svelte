<script lang="ts">
import type { DeviceRelations } from "common/schemas/device/index";
import DeviceForm from "$features/device-management/ui/device-form.svelte";
import * as Dialog from "$shared/ui/dialog/index.js";

let {
  open = $bindable(),
  device,
  title,
  description,
}: {
  open: boolean;
  title: string;
  device?: DeviceRelations;
  description?: string;
} = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>{title}</Dialog.Title>
      {#if description}
        <Dialog.Description>{description}</Dialog.Description>
      {/if}
    </Dialog.Header>
    <DeviceForm {device} bind:dialogState={open} />
  </Dialog.Content>
</Dialog.Root>
