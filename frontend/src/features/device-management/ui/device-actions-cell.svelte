<script lang="ts">
import { Download, QrCode, SquarePen, Trash } from "@lucide/svelte";
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
import { queryKeys } from "$shared/api/query-keys";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import DeviceDialog from "./device-dialog.svelte";
import QrDialog from "./qr-dialog.svelte";

let { device }: { device: DeviceRelations } = $props();

const queryClient = getQueryClientContext();
let isEditDialogOpen = $state(false);
let currentNetworkId = $derived(getNetworkId().id);

const deleteDeviceMutation = createMutation(() =>
  deviceDeletionMutation(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.network(currentNetworkId),
    });
  }),
);

let isQrCodeDialogOpen = $state(false);
let qrCode = $state<string>();
const queryOptions = () => deviceConfigQuery(currentNetworkId, device.id);
const config = createQuery(queryOptions);

function fetchConfig() {
  return queryClient.fetchQuery(queryOptions());
}

async function downloadConfig() {
  const data = await fetchConfig();

  const blob = new Blob([data.config], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = data.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function openQrCode() {
  const data = await fetchConfig();
  qrCode = data.qrCode;
  isQrCodeDialogOpen = true;
}

function handleDelete() {
  deleteDeviceMutation.mutate({
    networkId: currentNetworkId,
    deviceId: device.id,
  });
}
</script>

<div class="text-right">
  <Button variant="ghost" size="icon" onclick={() => isEditDialogOpen = true}>
    <SquarePen class="size-4" />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    onclick={openQrCode}
    disabled={config.isFetching}
  >
    <QrCode class="size-4" />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    onclick={downloadConfig}
    disabled={config.isFetching}
  >
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

<QrDialog bind:open={isQrCodeDialogOpen} qr={qrCode} />

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