<script lang="ts">
// biome-ignore lint/correctness/noUnusedImports: <he is using>
import { Tag as TagIcon } from "@lucide/svelte";
import type { Tag } from "common/schemas/tag/index";
import TagForm from "$features/tag-management/ui/tag-form.svelte";
import * as Dialog from "$shared/ui/dialog/index.js";

let {
  open = $bindable(),
  tag,
  title,
  description,
}: { open: boolean; title: string; tag?: Tag; description?: string } = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header class="flex flex-row items items-center gap-2">
      <div class="p-2 border border-muted-foreground bg-secondary rounded-full">
        <TagIcon class="size-6.5 stroke-secondary-foreground" />
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
    <TagForm {tag} bind:dialogState={open} />
  </Dialog.Content>
</Dialog.Root>
