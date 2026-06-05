<script lang="ts">
import { Slash } from "@lucide/svelte";
import { createQuery } from "@tanstack/svelte-query";
import { page } from "$app/state";
import { getNavItemIcon } from "$shared/lib/navigation-items.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import * as Breadcrumb from "$shared/ui/breadcrumb/index.js";
import { sidebarQuerys } from "$widgets/app-sidebar/api/index.svelte";

let currentNetworkId = $derived(getNetworkId().id);
const userNetworks = createQuery(() => sidebarQuerys.userNetworks());
let currentNetwork = $derived(
  userNetworks.data?.find((n) => n.id === currentNetworkId),
);
let currentPageName = page.url.pathname.split("/").at(-1) ?? "dashboard";
let Icon = $derived(getNavItemIcon(currentPageName));

let displayingPageName = $derived.by(() => {
  if (currentPageName === "dashboard") {
    return "Панель управления";
  } else if (currentPageName === "devices") {
    return "Устройства";
  } else if (currentPageName === "rules") {
    return "Правила";
  } else if (currentPageName === "tags") {
    return "Теги";
  } else if (currentPageName === "events") {
    return "События";
  } else {
    return "Конфигурация";
  }
});
</script>

<Breadcrumb.Root>
  <Breadcrumb.List class="text-[14px]">
    <Breadcrumb.Item>
      <p class="text-muted-foreground">{currentNetwork?.name}</p>
    </Breadcrumb.Item>
    <Breadcrumb.Separator>
      <p>/</p>
    </Breadcrumb.Separator>
    <Breadcrumb.Item>
      <Breadcrumb.Link
        href={`/app/network/${currentNetworkId}/${currentPageName}`}
        class="flex text-foreground font-semibold gap-1"
      >
        <Icon class="size-5" />
        <p>{displayingPageName}</p>
      </Breadcrumb.Link>
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb.Root>
