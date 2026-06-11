<script lang="ts">
import { ArrowDownLeft, ArrowUpRight, Clock, RefreshCw } from "@lucide/svelte";
import { createQuery } from "@tanstack/svelte-query";
import { deviceStatus } from "$pages/app/network/[slug]/devices/api/query";
import { getNetworkId } from "$shared/lib/network-id-context";
import { cn } from "$shared/lib/utils";
import * as Tooltip from "$shared/ui/tooltip";

let { deviceId }: { deviceId: string } = $props();

let currentNetworkId = $derived(getNetworkId().id);
const deviceStatusQuery = createQuery(() =>
  deviceStatus(currentNetworkId, deviceId),
);

let isOnline = $derived(deviceStatusQuery.data?.isOnline ?? false);
let requestTime = $derived(
  deviceStatusQuery.dataUpdatedAt
    ? new Date(deviceStatusQuery.dataUpdatedAt)
    : null,
);
let isFetching = $derived(deviceStatusQuery.isFetching);

function formatBytes(bytes: string | number | undefined) {
  if (bytes === undefined) return "0 B";
  let b = typeof bytes === "string" ? Number.parseInt(bytes, 10) : bytes;
  if (Number.isNaN(b)) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;

  while (b >= 1000 && i < units.length - 1) {
    b /= 1000;
    i++;
  }
  return `${b.toFixed(2)} ${units[i]}`;
}

function formatDate(date: string | number | Date | null | undefined) {
  if (!date) return "—";

  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) return "—";

  const diffInSeconds = Math.round((timestamp - Date.now()) / 1000);
  const absDiffInSeconds = Math.abs(diffInSeconds);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];
  const formatter = new Intl.RelativeTimeFormat("ru-RU", {
    numeric: "always",
  });

  const [unit, secondsInUnit] = units.find(
    ([, seconds]) => absDiffInSeconds >= seconds,
  ) ?? ["second", 1];

  return formatter.format(Math.round(diffInSeconds / secondsInUnit), unit);
}

function handleRefetch(e: MouseEvent) {
  e.stopPropagation();
  deviceStatusQuery.refetch();
}
</script>

<div class="flex items-center gap-2">
  <Tooltip.Provider>
    <Tooltip.Root delayDuration={200} disableCloseOnTriggerClick>
      <Tooltip.Trigger
        onclick={handleRefetch}
        class="group flex items-center gap-2 cursor-help select-none transition-opacity hover:opacity-80"
      >
        <div class="relative flex items-center justify-center">
          <div
            class={cn(
                "size-2 rounded-full transition-all duration-500",
                isOnline 
                  ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" 
                  : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
              )}
          ></div>
          {#if isOnline}
            <div
              class="absolute size-2 rounded-full bg-green-500 animate-ping opacity-30"
            ></div>
          {/if}
        </div>
        <span class="text-xs font-medium text-foreground/90">
          {isOnline ? "Подключено" : "Отключено"}
        </span>
        <div
          class="relative flex size-5 items-center justify-center rounded-full text-muted-foreground/60 outline-none transition-colors group-hover:text-foreground disabled:pointer-events-none"
        >
          <RefreshCw
            class={cn(
                  "size-3.5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]", 
                  isFetching ? "animate-spin text-foreground" : "group-hover:rotate-180"
                )}
          />

          <span
            class="absolute inset-0 -z-10 scale-50 rounded-full bg-muted/0 transition-all duration-300 group-hover:scale-125 group-hover:bg-muted/50 group-active:scale-110"
          ></span>
        </div>
      </Tooltip.Trigger>

      {#if isOnline && deviceStatusQuery.data}
        <Tooltip.Content
          side="top"
          align="center"
          arrowClasses="bg-background"
          class="min-w-64 border-border/50 bg-background/98 p-3 shadow-xl backdrop-blur-sm"
        >
          <div class="space-y-2.5">
            <div class="flex items-center justify-between gap-6">
              <div class="flex items-center gap-1.5 text-muted-foreground">
                <Clock class="size-3.5" />
                <span class="text-xs">Последнее рукопожатие</span>
              </div>
              <span class="text-xs font-medium tabular-nums text-foreground">
                {formatDate(deviceStatusQuery.data.lastHandshakeTime)}
              </span>
            </div>

            <div class="flex items-center justify-between gap-6">
              <div class="flex items-center gap-1.5 text-muted-foreground">
                <RefreshCw class="size-3.5" />
                <span class="text-xs">Обновлено</span>
              </div>
              <span class="text-xs font-medium tabular-nums text-foreground">
                {formatDate(requestTime)}
              </span>
            </div>

            <div class="h-px bg-border/40"></div>

            <div class="flex items-center justify-between gap-6">
              <div class="flex items-center gap-1.5 text-muted-foreground">
                <ArrowDownLeft class="size-3.5 text-green-600/70" />
                <span class="text-xs">Входящий</span>
              </div>
              <span class="text-xs font-semibold tabular-nums text-foreground">
                {formatBytes(deviceStatusQuery.data.bytesReceived)}
              </span>
            </div>

            <div class="flex items-center justify-between gap-6">
              <div class="flex items-center gap-1.5 text-muted-foreground">
                <ArrowUpRight class="size-3.5 text-blue-600/70" />
                <span class="text-xs">Исходящий</span>
              </div>
              <span class="text-xs font-semibold tabular-nums text-foreground">
                {formatBytes(deviceStatusQuery.data.bytesSent)}
              </span>
            </div>
          </div>
        </Tooltip.Content>
      {/if}
    </Tooltip.Root>
  </Tooltip.Provider>

  <!-- <button
    type="button"
    disabled={isFetching}
    class="group relative flex size-5 items-center justify-center rounded-full text-muted-foreground/60 outline-none transition-colors hover:text-foreground disabled:pointer-events-none"
    title="Обновить статус"
  >
  </button> -->
</div>
