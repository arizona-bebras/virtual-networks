<script lang="ts">
import { Plus } from "@lucide/svelte";
import type { Tag } from "common/schemas/tag/index";
import { page } from "$app/state";
import TagForm from "$features/tag-management/ui/tag-form.svelte";
import { Button } from "$shared/ui/button/index.js";
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
    <Dialog.Header>
      <Dialog.Title>{title}</Dialog.Title>
      {#if description}
        <Dialog.Description>{description}</Dialog.Description>
      {/if}
    </Dialog.Header>
    <TagForm {tag} bind:dialogState={open} />
  </Dialog.Content>
</Dialog.Root>
