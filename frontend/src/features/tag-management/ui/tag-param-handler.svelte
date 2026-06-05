<script lang="ts">
import type { Tag } from "common/schemas/tag/index";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import TagDialog from "./tag-dialog.svelte";

let {
  tags,
  globalFilter = $bindable(),
}: {
  tags: Tag[] | undefined;
  globalFilter: string;
} = $props();

let isEditingDialogOpen = $state(false);

let tagIdSearchParam = $derived(page.url.searchParams.get("editTag"));
let tagNameSearchParam = $derived(page.url.searchParams.get("name"));

let editingTag = $derived(tags?.find((t) => t.id === tagIdSearchParam));

$effect(() => {
  if (tagIdSearchParam) {
    isEditingDialogOpen = true;
  }
});

$effect(() => {
  if (tagNameSearchParam) {
    globalFilter = tagNameSearchParam;
  }
});

$effect(() => {
  if (!isEditingDialogOpen && tagIdSearchParam) {
    const newUrl = new URL(page.url);
    newUrl.searchParams.delete("editTag");
    goto(newUrl, { replaceState: true, keepFocus: true });
  }
});
</script>

<TagDialog
  bind:open={isEditingDialogOpen}
  title="Редактировать тег"
  tag={editingTag}
  description="Измените параметры вашего тега"
/>
