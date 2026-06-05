<script lang="ts">
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Monitor,
  NotebookText,
  PanelRightClose,
  Plus,
  Settings,
  ShieldAlert,
  Tag,
} from "@lucide/svelte";
import { createQuery, getQueryClientContext } from "@tanstack/svelte-query";
import { PanelRightOpen } from "lucide-svelte";
import { getContext, untrack } from "svelte";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { authClient } from "$shared/api/auth-client";
import { getNetworkId } from "$shared/lib/network-id-context";
import * as Sidebar from "$shared/ui/sidebar/index.js";
import { useSidebar } from "$shared/ui/sidebar/index.js";
import NetworkSelector from "$widgets/app-sidebar/ui/network-select.svelte";
import { sidebarQuerys } from "../api/index.svelte";

// Mock networks.
const networks = [
  { id: "1", name: "Default Network", cidr: "10.0.0.0/24" },
  { id: "2", name: "IT Department", cidr: "192.168.1.0/24" },
  { id: "3", name: "Production", cidr: "172.16.0.0/16" },
];

let currentNetworkUUID = $derived(getNetworkId().id);

const userNetworks = createQuery(() => sidebarQuerys.userNetworks());
const queryClient = getQueryClientContext();

let isDialogOpen = $state(false);
let selectedNetwork = $derived(
  userNetworks.data?.find((n) => n.id === currentNetworkUUID),
);

const navItems = $derived([
  {
    title: "Панель управления",
    url: `/app/network/${currentNetworkUUID}/dashboard`,
    icon: LayoutDashboard,
  },
  {
    title: "Устройства",
    url: `/app/network/${currentNetworkUUID}/devices`,
    icon: Monitor,
  },
  {
    title: "Правила",
    url: `/app/network/${currentNetworkUUID}/rules`,
    icon: ShieldAlert,
  },
  {
    title: "Теги",
    url: `/app/network/${currentNetworkUUID}/tags`,
    icon: Tag,
  },
  {
    title: "Конфигурация",
    url: `/app/network/${currentNetworkUUID}/config`,
    icon: Settings,
  },
  {
    title: "События",
    url: `/app/network/${currentNetworkUUID}/events`,
    icon: NotebookText,
  },
]);
async function handleLogout() {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        goto("/auth/login");
      },
    },
  });
}

// $effect(() => {
//   if (userNetworks.isSuccess){
//     untrack(() => {

//     })
//   })
const sidebar = useSidebar();
$inspect(sidebar.state);
</script>
{#if userNetworks.isSuccess}
  <Sidebar.Root collapsible="icon">
    <Sidebar.Header>
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <NetworkSelector {userNetworks} {selectedNetwork} />
        </Sidebar.MenuItem>
      </Sidebar.Menu>
    </Sidebar.Header>

    <Sidebar.Content>
      {#if selectedNetwork}
        <Sidebar.Group>
          <Sidebar.GroupLabel>Управление</Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu class="gap-0.5">
              {#each navItems as item (item.title)}
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton
                    class="rounded-[6px] {page.url.pathname === item.url ? 'border border-border bg-sidebar-primary font-medium':''}"
                  >
                    {#snippet child({ props })}
                      <a href={item.url} {...props}>
                        <item.icon class="size-4" />
                        <span class="">{item.title}</span>
                      </a>
                    {/snippet}
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              {/each}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      {/if}
    </Sidebar.Content>

    <Sidebar.Footer>
      <Sidebar.Menu class="gap-0.5">
        <Sidebar.MenuItem>
          <Sidebar.MenuButton onclick={handleLogout} class="rounded-[6px]">
            <LogOut class="size-4" />
            <span>Выйти</span>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
        <Sidebar.MenuItem onclick={() => sidebar.toggle()}>
          <Sidebar.MenuButton class="rounded-[6px]">
            {#if sidebar.state === 'collapsed'}
              <PanelRightClose />
            {:else}
              <PanelRightOpen />
            {/if}
            <p>Свернуть</p>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
    </Sidebar.Footer>
  </Sidebar.Root>
{/if}
