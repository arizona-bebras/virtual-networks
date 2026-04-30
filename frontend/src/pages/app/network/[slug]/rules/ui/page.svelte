<script lang="ts">
import { createQueries, createQuery } from "@tanstack/svelte-query";
import {
  columns,
  type RuleMock,
} from "$features/rule-management/model/rule-table-columns";
import AddRuleBtn from "$features/rule-management/ui/add-rule-btn.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import * as Card from "$shared/ui/card/index.js";
import DataTable from "$shared/ui/data-table/data-table.svelte";
import { userRules } from "../api/query";

let isAddRuleDialogOpen = $state(false);

// const mockRules: RuleMock[] = [
//   {
//     id: "1",
//     description: "Allow SSH",
//     sourceTag: "admin",
//     destTag: "servers",
//     protocol: "tcp",
//     port: 22,
//   },
//   {
//     id: "2",
//     description: "HTTP Access",
//     sourceTag: "users",
//     destTag: "web-servers",
//     protocol: "tcp",
//     port: 80,
//   },
//   {
//     id: "3",
//     description: "HTTPS Access",
//     sourceTag: "users",
//     destTag: "web-servers",
//     protocol: "tcp",
//     port: 443,
//   },
//   {
//     id: "4",
//     description: "DNS Queries",
//     sourceTag: "any",
//     destTag: "dns-servers",
//     protocol: "udp",
//     port: 53,
//   },
//   {
//     id: "5",
//     description: "Internal DB",
//     sourceTag: "web-servers",
//     destTag: "db-servers",
//     protocol: "tcp",
//     port: 5432,
//   },
// ];
const currentNetworkId = $derived(getNetworkId().id);
const userRulesQuery = createQuery(() => userRules(currentNetworkId));

function bulkRemoveSelected(_ids: string[]) {
  console.log("Delete rules:", _ids);
}
</script>

<div class="p-8">
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Rules</h1>
      <p class="text-muted-foreground">Manage network access control rules.</p>
    </div>

    <AddRuleBtn bind:open={isAddRuleDialogOpen} />
  </div>

  <Card.Root>
    <Card.Content class="p-6">
      <DataTable
        {columns}
        data={userRulesQuery.data || []}
        onDeleteSelected={bulkRemoveSelected}
      />
    </Card.Content>
  </Card.Root>
</div>
