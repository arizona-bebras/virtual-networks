<script lang="ts">
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Monitor,
  Plus,
  Settings,
  Tag,
} from "@lucide/svelte";
import { createQuery } from "@tanstack/svelte-query";
import { goto } from "$app/navigation";
import AddNetworkBtn from "$features/sidebar/header/ui/new-network-dialog.svelte";
import { authClient } from "$shared/api/auth-client";
import * as DropdownMenu from "$shared/ui/dropdown-menu/index.js";
import * as Sidebar from "$shared/ui/sidebar/index.js";
import { sidebarQuerys } from "../api/index.svelte";

// Mock networks.
const networks = [
  { id: "1", name: "Default Network", cidr: "10.0.0.0/24" },
  { id: "2", name: "IT Department", cidr: "192.168.1.0/24" },
  { id: "3", name: "Production", cidr: "172.16.0.0/16" },
];

let selectedNetwork = $state(networks[0]);
let isDialogOpen = $state(false);

const navItems = $derived([
  {
    title: "Dashboard",
    url: "/app/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Devices",
    url: "/app/devices",
    icon: Monitor,
  },
  {
    title: "Tags",
    url: "/app/tags",
    icon: Tag,
  },
  {
    title: "Configuration",
    url: `/app/networks/${selectedNetwork?.id}/config`,
    icon: Settings,
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

const networkQuery = createQuery(() =>
  sidebarQuerys.networkDetails("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"),
);
</script>

<Sidebar.Root>
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger class="w-full">
            <Sidebar.MenuButton size="lg" class="w-full justify-between">
              <div class="flex items-center gap-2">
                <div
                  class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                >
                  <LayoutDashboard class="size-4" />
                </div>
                <div class="flex flex-col gap-0.5 text-left">
                  <span class="text-sm font-semibold truncate w-32">
                    {selectedNetwork?.name}
                  </span>
                  <span class="text-xs text-muted-foreground">
                    {selectedNetwork?.cidr}
                  </span>
                </div>
              </div>
              <ChevronDown class="size-4 opacity-50" />
            </Sidebar.MenuButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content class="w-56" align="start">
            <DropdownMenu.Label>Networks</DropdownMenu.Label>
            {#each networks as network}
              <DropdownMenu.Item onSelect={() => (selectedNetwork = network)}>
                {network.name}
              </DropdownMenu.Item>
            {/each}
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              onSelect={(e) => {
                e.preventDefault();
                isDialogOpen = true;
              }}
            >
              <Plus class="mr-2 size-4" />
              <span>New Network</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <AddNetworkBtn bind:isDialogOpen />
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>

  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupLabel>Management</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {#each navItems as item (item.title)}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton>
                {#snippet child({ props })}
                  <a href={item.url} {...props}>
                    <item.icon class="size-4" />
                    <span>{item.title}</span>
                  </a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
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
