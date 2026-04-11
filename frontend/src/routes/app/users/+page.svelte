<script lang="ts">
import { createColumns, type User } from "$lib/components/table/columns.js";
import DataTable from "$lib/components/table/data-table.svelte";

let vpnUsers = $state<User[]>([
  {
    id: "u-9821",
    email: "ivanov@company.com",
    tags: ["Admin", "Moscow", "High-Priority"],
    deviceCount: 3,
    configs: ["mbp-work", "iphone-15", "home-pc"],
    status: "active",
    lastActivity: "2026-04-05T14:20:00Z",
  },
  {
    id: "u-4412",
    email: "petrov_sales@gmail.com",
    tags: ["Sales", "Mobile-only"],
    deviceCount: 1,
    configs: ["samsung-s24"],
    status: "active",
    lastActivity: "2026-04-06T08:12:45Z",
  },
  {
    id: "u-0034",
    email: "s.smith@global.net",
    tags: ["Premium", "EU-Cluster"],
    deviceCount: 5,
    configs: ["router-home", "ipad-pro", "laptop-1", "laptop-2", "phone"],
    status: "expired",
    lastActivity: "2026-03-30T11:00:00Z",
  },
  {
    id: "u-7756",
    email: "tech_support@work.io",
    tags: ["Support", "No-Logs", "Dev-Net"],
    deviceCount: 12,
    configs: ["vm-debug-01", "vm-debug-02", "workstation-main"],
    status: "active",
    lastActivity: "2026-04-06T09:30:12Z",
  },
]);

const handleRemoveUser = (id: string) => {
  vpnUsers = vpnUsers.filter((user) => user.id !== id);
};
</script>

<!-- <p>Hello from Users!</p> -->
<DataTable data={vpnUsers} columns={createColumns(handleRemoveUser)} />
<!-- <button
	onclick={() => {
		vpnUsers.push({
			id: 'u-7752',
			email: 'tech_support@work.io',
			tags: ['Support', 'No-Logs', 'Dev-Net'],
			deviceCount: 12,
			configs: ['vm-debug-01', 'vm-debug-02', 'workstation-main'],
			status: 'active',
			lastActivity: '2026-04-06T09:30:12Z'
		});
		console.log(vpnUsers);
	}}>Remove first element</button
> -->