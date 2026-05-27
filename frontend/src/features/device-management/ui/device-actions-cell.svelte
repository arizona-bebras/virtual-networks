<script lang="ts">
import { Download, Ellipsis, QrCode, SquarePen, Trash } from "@lucide/svelte";
import {
  createMutation,
  createQuery,
  getQueryClientContext,
} from "@tanstack/svelte-query";
import type { DeviceRelations } from "common/schemas/device/index";
import {
  deviceConfigQuery,
  deviceDeletionMutation,
} from "$features/device-management/api/query";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import * as Dialog from "$shared/ui/dialog/index.js";
import * as DropdownMenu from "$shared/ui/dropdown-menu/index.js";
import DeviceDialog from "./device-dialog.svelte";
import DeviceForm from "./device-form.svelte";
import QrDialog from "./qr-dialog.svelte";

let { device }: { device: DeviceRelations } = $props();

const queryClient = getQueryClientContext();
let isEditDialogOpen = $state(false);
let currentNetworkId = $derived(getNetworkId().id);

const deleteDeviceMutation = createMutation(() =>
  deviceDeletionMutation(() => {
    queryClient.invalidateQueries({ queryKey: ["userDevices"] });
  }),
);

let isQrCodeDialogOpen = $state(false);
const queryOptions = () => deviceConfigQuery(currentNetworkId, device.id);
const config = createQuery(queryOptions);

async function downloadConfig() {
  await queryClient.ensureQueryData({ queryKey: queryOptions().queryKey });

  if (!config.data) return;
  const blob = new Blob([config.data.config], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = config.data.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function handleDelete() {
  deleteDeviceMutation.mutate({
    networkId: currentNetworkId,
    deviceId: device.id,
  });
}
$inspect(config.data?.qrCode);
</script>

<div class="text-right">
  <Button variant="ghost" size="icon" onclick={() => isEditDialogOpen = true}>
    <SquarePen class="size-4" />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    onclick={() => {
      queryClient.ensureQueryData({ queryKey: queryOptions().queryKey });
      isQrCodeDialogOpen = true;
    }}
  >
    <QrCode class="size-4" />
  </Button>
  <Button variant="ghost" size="icon" onclick={downloadConfig}>
    <Download class="size-4" />
  </Button>
  <Button
    variant="destructive"
    size="icon"
    class="rounded-[6px]"
    onclick={handleDelete}
  >
    <Trash class="size-4" />
  </Button>
</div>

<DeviceDialog
  bind:open={isEditDialogOpen}
  title="Редактирование устройства"
  {device}
  description="Измените параметры своего устройства"
/>

<QrDialog bind:open={isQrCodeDialogOpen} qr={config.data?.qrCode} />

<!-- <Dialog.Root bind:open={isEditDialogOpen}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit Device</Dialog.Title>
      <Dialog.Description>
        Update the details for your device.
      </Dialog.Description>
    </Dialog.Header>
    <DeviceForm {device} bind:dialogState={isEditDialogOpen} />
  </Dialog.Content>
</Dialog.Root> -->