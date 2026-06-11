<script lang="ts">
import { History, Info } from "lucide-svelte";
import { slide } from "svelte/transition";
import type { ValidationResult } from "../model/types";

let { info }: { info: ValidationResult | null } = $props();

let title = $derived(
  info?.isValid ? "Конфигурация сети" : "Неполная настройка",
);
</script>

{#if info}
  <div
    transition:slide={{ duration: 200 }}
    class="mt-4 flex flex-col gap-3 rounded-[8px] border border-[#E5E5E5] bg-[#F5F5F5] p-3 shadow-sm"
  >
    <div class="flex items-center gap-3">
      <div
        class="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E5E5E5] bg-[#F5F5F5]"
      >
        <div
          class="absolute inset-0 flex items-center justify-center opacity-30"
        >
          <div class="h-full w-[1px] bg-gray-400"></div>
          <div class="absolute h-[1px] w-full bg-gray-400"></div>
        </div>
        <div
          class="absolute h-[20px] w-[20px] rounded-full border border-gray-400 opacity-30"
        ></div>
        <div
          class="absolute h-[34px] w-[34px] rounded-full border border-gray-400 opacity-30"
        ></div>

        <div class="relative z-10 text-gray-700">
          <Info size={24} strokeWidth={2.5} />
        </div>
      </div>

      <div class="min-w-0 flex-col w-full">
        <h4 class="text-[13px] font-bold text-gray-900">{title}</h4>
        {#if info.isValid}
          <div
            class="text-[12px] text-gray-500 leading-tight mt-0.5 flex justify-between"
          >
            <p>Диапазон:</p>
            <p class="text-foreground font-bold">
              {info.firstHost} - {info.lastHost}
            </p>
          </div>
          <div
            class="text-[12px] text-gray-500 leading-tight mt-0.5 flex justify-between"
          >
            <p>Доступно хостов:</p>
            <p class="text-foreground font-bold">{info.hostCount}</p>
          </div>
        {:else}
          <p>
            Недопустимое значение октета. Пожалуйста, используйте <span
              class="font-bold"
            >
              {info.error.suggestion.lower}
            </span>
            {#if info.error.suggestion.upper !== -1}
              <span>
                или <span class="font-bold">{info.error.suggestion.upper}</span>
              </span>
            {/if}
          </p>
        {/if}
      </div>
    </div>
  </div>
{/if}
