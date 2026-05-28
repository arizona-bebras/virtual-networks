<script lang="ts">
import { CheckIcon, ChevronsUpDownIcon } from "@lucide/svelte";
import { tick } from "svelte";
import { cn } from "$shared/lib/utils";
import { Button } from "$shared/ui/button";
import * as Command from "$shared/ui/command/index.js";
import * as Popover from "$shared/ui/popover/index.js";

let {
  selectedMask = $bindable(),
  onMaskChange,
}: { selectedMask: string; onMaskChange: (mask: string) => void } = $props();

let maskRange = Array.from({ length: 32 }, (_, i) => i + 1);

let displayingValue = $state(
  maskRange.find((f) => f === parseInt(selectedMask, 10)),
);

let open = $state(false);
let triggerRef = $state<HTMLButtonElement>(null!);

function closeAndFocusTrigger() {
  open = false;
  tick().then(() => {
    triggerRef.focus();
  });
}
</script>
<Popover.Root bind:open>
  <Popover.Trigger bind:ref={triggerRef}>
    <Button
      variant="outline"
      class="w-[80px] border-none bg-transparent! focus:ring-0"
    >
      {displayingValue || "Выберите маску"}
      <ChevronsUpDownIcon class="ms-2 size-4 shrink-0 opacity-50" />
    </Button>
  </Popover.Trigger>
  <Popover.Content class="w-[200px] p-0">
    <Command.Root>
      <Command.Input placeholder="Выберите маску" class="mb-0" />
      <Command.List>
        <Command.Empty>No framework found.</Command.Empty>
        <Command.Group>
          {#each maskRange as mask}
            <Command.Item
              value={mask.toString()}
              onSelect={() => {
                displayingValue = mask;
                selectedMask = mask.toString();
                onMaskChange(mask.toString())
                closeAndFocusTrigger();
              }}
            >
              <CheckIcon
                class={cn(
                  "me-2 size-4",
                  displayingValue !== mask && "text-transparent"
                )}
              />
              {mask}
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
