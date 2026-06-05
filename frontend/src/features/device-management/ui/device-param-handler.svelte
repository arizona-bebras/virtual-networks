<script lang="ts">
import type { DeviceRelations } from "common/schemas/device/index";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import DeviceDialog from "./device-dialog.svelte";

let {
  devices,
  globalFilter = $bindable(),
}: {
  devices: DeviceRelations[] | undefined;
  globalFilter: string;
} = $props();

let isEditingDialogOpen = $state(false);

let deviceIdSearchParam = $derived(page.url.searchParams.get("editDevice"));
let deviceNameSearchParam = $derived(page.url.searchParams.get("name"));

let editingDevice = $derived(
  devices?.find((d) => d.id === deviceIdSearchParam),
);

$effect(() => {
  if (deviceIdSearchParam) {
    isEditingDialogOpen = true;
  }
});

$effect(() => {
  if (deviceNameSearchParam) {
    globalFilter = deviceNameSearchParam;
  }
});

$effect(() => {
  if (!isEditingDialogOpen && deviceIdSearchParam) {
    const newUrl = new URL(page.url);
    newUrl.searchParams.delete("editDevice");
    goto(newUrl, { replaceState: true, keepFocus: true });
  }
});
</script>

<DeviceDialog
  bind:open={isEditingDialogOpen}
  title="Редактирование устройства"
  device={editingDevice}
  description="Измените параметры своего устройства"
/>
