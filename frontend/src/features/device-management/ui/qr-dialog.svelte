<script lang="ts">
import { MonitorSmartphone } from "@lucide/svelte";
import * as Dialog from "$shared/ui/dialog/index.js";

let {
  open = $bindable(),
  qr,
}: {
  open: boolean;
  qr?: string;
} = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-106.25 flex flex-col items-center">
    <Dialog.Header class="flex flex-row items items-center gap-2">
      <div class="p-2 border border-muted-foreground bg-secondary rounded-full">
        <MonitorSmartphone class="size-6.5 stroke-secondary-foreground" />
      </div>
      <div>
        <Dialog.Title class="font-semibold mb-0.5">QR-код</Dialog.Title>
        <Dialog.Description class="text-[12px]" style="line-height:normal">
          Отсканируйте QR-код в приложении Wireguard, чтобы добавить устройство
        </Dialog.Description>
      </div>
    </Dialog.Header>
    <img src={qr} alt="qr-код">
  </Dialog.Content>
</Dialog.Root>
