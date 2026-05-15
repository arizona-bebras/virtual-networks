<script lang="ts">
import { Filter } from "@lucide/svelte";
import type { Column } from "@tanstack/table-core";
import type { RuleRelation } from "common/schemas/rule/index";
import TagSelector from "$features/tag-management/ui/tag-selector.svelte";
import { Button } from "$shared/ui/button/index.js";
import * as Popover from "$shared/ui/popover/index.js";

let {
  column,
  label,
}: { column: Column<RuleRelation, unknown>; label: string } = $props();

let filterValue = $derived(column.getFilterValue());
</script>

<div class="flex items-center gap-1">
  <span class="font-medium">{label}</span>

  <Popover.Root>
    <Popover.Trigger>
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 {filterValue ? 'text-primary' : 'text-muted-foreground'}"
      >
        <Filter class="h-3.5 w-3.5" />
      </Button>
    </Popover.Trigger>
    <Popover.Content class="w-72 p-4" align="start">
      <div class="space-y-4">
        <div class="space-y-2">
          <h4 class="font-medium leading-none">Filter by {label}</h4>
          <p class="text-sm text-muted-foreground">
            Select tag names to filter.
          </p>
        </div>

        <TagSelector {column} />
      </div>
    </Popover.Content>
  </Popover.Root>
</div>
