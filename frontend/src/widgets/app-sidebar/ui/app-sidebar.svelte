<script lang="ts">
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Monitor,
  Plus,
  Settings,
  ShieldAlert,
  Tag,
} from "@lucide/svelte";
import { createQuery, getQueryClientContext } from "@tanstack/svelte-query";
import { getContext, untrack } from "svelte";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { authClient } from "$shared/api/auth-client";
import { getNetworkId } from "$shared/lib/network-id-context";
import * as Sidebar from "$shared/ui/sidebar/index.js";
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
    title: "Dashboard",
    url: `/app/network/${currentNetworkUUID}/dashboard`,
    icon: LayoutDashboard,
  },
  {
    title: "Devices",
    url: `/app/network/${currentNetworkUUID}/devices`,
    icon: Monitor,
  },
  {
    title: "Rules",
    url: `/app/network/${currentNetworkUUID}/rules`,
    icon: ShieldAlert,
  },
  {
    title: "Tags",
    url: `/app/network/${currentNetworkUUID}/tags`,
    icon: Tag,
  },
  {
    title: "Configuration",
    url: `/app/network/${currentNetworkUUID}/config`,
    icon: Settings,
  },
]);
console.log(page.url.pathname);
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
</script>
{#if userNetworks.isSuccess}
  <Sidebar.Root>
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
          <Sidebar.GroupLabel>Management</Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu class="gap-0.5">
              {#each navItems as item (item.title)}
                <Sidebar.MenuItem class="pl-1">
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
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <Sidebar.MenuButton onclick={handleLogout}>
            <LogOut class="size-4" />
            <span>Logout</span>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
    </Sidebar.Footer>
  </Sidebar.Root>
{/if}
