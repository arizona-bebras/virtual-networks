<script lang="ts">
import { ChevronDown, Globe, Network, Plus } from "@lucide/svelte";
import type { CreateQueryResult } from "@tanstack/svelte-query";
import { goto } from "$app/navigation";
import AddNetworkBtn from "$features/sidebar/header/ui/new-network-dialog.svelte";
import type { SuccessUserNetworks } from "$shared/api/swagger";
import * as DropdownMenu from "$shared/ui/dropdown-menu/index.js";
import * as Sidebar from "$shared/ui/sidebar/index.js";

let {
  userNetworks,
  selectedNetwork,
}: {
  userNetworks: CreateQueryResult<SuccessUserNetworks>;
  selectedNetwork: SuccessUserNetworks[number] | undefined;
} = $props();

let isDialogOpen = $state(false);
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger class="w-full">
    <Sidebar.MenuButton size="lg" class="w-full justify-between">
      <div class="flex items-center gap-2">
        <div
          class="flex aspect-square size-8 items-center justify-center rounded-lg bg-secondary text-primary-foreground"
        >
          <Network class="size-6.25" />
        </div>
        {#if !selectedNetwork}
          <span class="text-sm font-semibold truncate w-32">Выберите сеть</span>
        {:else}
          <div class="flex flex-col gap-0.5 text-left">
            <span class="text-sm font-semibold truncate w-32">
              {selectedNetwork?.name ?? userNetworks.data?.[0]?.name}
            </span>
            <span class="text-xs text-muted-foreground truncate ellipsis w-32">
              {selectedNetwork?.description ?? userNetworks.data?.[0]?.description}
            </span>
          </div>
        {/if}
      </div>
      <ChevronDown class="size-4 opacity-50" />
    </Sidebar.MenuButton>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="w-70 p-1 rounded-lg " align="start">
    {#if userNetworks.data!.length > 0}
      <DropdownMenu.Label class="text-center">Выберите сеть</DropdownMenu.Label>
      {#each userNetworks.data as network}
        {@const isCurrent = selectedNetwork === network}
        <DropdownMenu.Item
          class="group flex w-full items-start justify-between gap-3 {isCurrent ? 'border border-border border-l-4 border-l-secondary rounded-r-lg bg-white' : ''}"
          onSelect={async () => {
                  goto(`/app/network/${network.id}/dashboard`);
                }}
        >
          <div class="flex min-w-0 flex-1 items-center gap-3 px-2 py-2.5">
            <div
              class="{isCurrent ? 'bg-secondary' : ''} flex size-8 shrink-0 items-center justify-center rounded-[6px]"
            >
              <Network
                class="size-6.25 {isCurrent ? 'stroke-secondary-foreground' : 'stroke-muted-foreground'}"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium">{network.name}</p>
              <p
                class="line-clamp-2 whitespace-normal break-words text-muted-foreground"
                title={network.description}
              >
                {network.description || "Без описания"}
              </p>
            </div>
          </div>
          <div class="flex shrink-0 flex-col gap-1 py-2.5 pr-2 text-right">
            <p
              class="{isCurrent ? 'bg-secondary text-secondary-foreground': ''} whitespace-nowrap border px-1 py-0.5 rounded-[4px]"
            >
              {network.cidr}
            </p>
            <div class="flex max-w-28 self-end justify-end">
              <Globe class="size-4 shrink-0" />
              <p class="truncate">.{network.domain}</p>
            </div>
          </div>
        </DropdownMenu.Item>
      {/each}
      <DropdownMenu.Separator class="mt-1.25" />
    {/if}
    <DropdownMenu.Item
      class="mt-1 w-full bg-secondary rounded-[8px] gap-1 flex items-center justify-center hover:bg-secondary-accent! hover:text-lime-500!"
      onSelect={() => {
                isDialogOpen = true;
              }}
    >
      <span class="text-secondary-foreground font-semibold text-[12px]">
        Создать новую сеть
      </span>
      <Plus class=" size-4 stroke-secondary-foreground" />
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
<AddNetworkBtn bind:isDialogOpen />
