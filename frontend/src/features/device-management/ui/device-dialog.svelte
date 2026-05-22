<script lang="ts">
import { MonitorSmartphone } from "@lucide/svelte";
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
    <Dialog.Header class="flex flex-row items items-center gap-2">
      <div class="p-2 border border-muted-foreground bg-secondary rounded-full">
        <MonitorSmartphone class="size-6.5 stroke-secondary-foreground" />
      </div>
      <div>
        <Dialog.Title class="font-semibold mb-0.5">{title}</Dialog.Title>
        {#if description}
          <Dialog.Description class="text-[12px]" style="line-height:normal">
            {description}
          </Dialog.Description>
        {/if}
      </div>
    </Dialog.Header>
    <DeviceForm {device} bind:dialogState={open} />
  </Dialog.Content>
</Dialog.Root>
