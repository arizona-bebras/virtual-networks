<script lang="ts">
import { SquarePen, Trash } from "@lucide/svelte";
import { createMutation, useQueryClient } from "@tanstack/svelte-query";
import type { RuleRelation } from "common/schemas/rule/index";
import { queryKeys } from "$shared/api/query-keys";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import * as Dialog from "$shared/ui/dialog/index.js";
import * as DropdownMenu from "$shared/ui/dropdown-menu/index.js";
import { ruleDeletionMutation } from "../api/query";
import RuleDialog from "./rule-dialog.svelte";
import RuleForm from "./rule-form.svelte";

let { rule }: { rule: RuleRelation } = $props();

const networkId = $derived(getNetworkId().id);
const queryClient = useQueryClient();
const deleteMutation = createMutation(() =>
  ruleDeletionMutation(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.networkRules(networkId),
    });
  }),
);

let isEditDialogOpen = $state(false);

function handleDelete() {
  deleteMutation.mutate({ networkId, ruleId: rule.id });
}
</script>

<div class="text-right">
  <Button variant="ghost" size="icon" onclick={() => isEditDialogOpen = true}>
    <SquarePen class="size-4" />
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

<RuleDialog
  bind:open={isEditDialogOpen}
  title="Редактировать правило"
  {rule}
  description="Обновите данные вашего правила"
/>
