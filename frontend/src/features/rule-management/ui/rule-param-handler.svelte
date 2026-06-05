<script lang="ts">
import type { RuleRelation } from "common/schemas/rule/index";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import RuleDialog from "./rule-dialog.svelte";

let {
  rules,
  globalFilter = $bindable(),
}: {
  rules: RuleRelation[] | undefined;
  globalFilter: string;
} = $props();

let isEditingDialogOpen = $state(false);

let ruleIdSearchParam = $derived(page.url.searchParams.get("editRule"));
let ruleDescriptionSearchParam = $derived(
  page.url.searchParams.get("description"),
);

let editingRule = $derived(rules?.find((r) => r.id === ruleIdSearchParam));

$effect(() => {
  if (ruleIdSearchParam) {
    isEditingDialogOpen = true;
  }
});

$effect(() => {
  if (ruleDescriptionSearchParam) {
    globalFilter = ruleDescriptionSearchParam;
  }
});

$effect(() => {
  if (!isEditingDialogOpen && ruleIdSearchParam) {
    const newUrl = new URL(page.url);
    newUrl.searchParams.delete("editRule");
    goto(newUrl, { replaceState: true, keepFocus: true });
  }
});
</script>

<RuleDialog
  bind:open={isEditingDialogOpen}
  title="Редактировать правило"
  rule={editingRule}
  description="Обновите данные вашего правила"
/>
