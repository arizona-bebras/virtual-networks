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
      Добавить устройство
    </Button>
  </Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Добавить устройство</Dialog.Title>
      <Dialog.Description>
        Зарегистрируйте новое устройство в вашей виртуальной сети
      </Dialog.Description>
    </Dialog.Header>
    <DeviceForm bind:dialogState={open} />
  </Dialog.Content>
</Dialog.Root>
