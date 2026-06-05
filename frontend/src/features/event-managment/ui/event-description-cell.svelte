<script lang="ts">
import type { Event } from "common/schemas/event/index";

let { action }: { action: Event["action"] } = $props();
</script>

{#if action.type === "create"}
  <span class="text-muted-foreground text-sm">Создана новая сущность</span>
{:else if action.type === "delete"}
  <span class="text-muted-foreground text-sm">Сущность была удалена</span>
{:else if action.type === "update"}
  <div class="flex flex-col gap-1">
    {#each action.updatedFields as field}
      <div class="flex items-center gap-1.5 text-xs">
        <span
          class="font-semibold text-foreground/70 whitespace-nowrap lowercase"
        >
          {field.key}
          :
        </span>
        <div class="flex items-center gap-1 min-w-0">
          <span
            class="text-muted-foreground line-through truncate max-w-[100px]"
            title={field.old}
          >
            {field.old}
          </span>
          <span class="text-muted-foreground/40 text-[10px]">→</span>
          <span
            class="text-foreground truncate max-w-[100px] font-medium"
            title={field.new}
          >
            {field.new}
          </span>
        </div>
      </div>
    {/each}
  </div>
{/if}
