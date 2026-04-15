import type { ColumnDef } from "@tanstack/table-core";
import DataTableCheckbox from "$lib/components/table/data-table-checkbox.svelte";
import DataTableSortButton from "$lib/components/table/data-table-sort-button.svelte";
import { renderComponent } from "$lib/components/ui/data-table/index.js";
import DeviceActionsCell from "./DeviceActionsCell.svelte";
import DeviceNameCell from "./DeviceNameCell.svelte";
import DeviceStatusCell from "./DeviceStatusCell.svelte";
import DeviceTagsCell from "./DeviceTagsCell.svelte";

export type Device = {
  id: string;
  name: string;
  ip: string;
  status: "online" | "offline";
  tags: string[];
};

export const columns: ColumnDef<Device>[] = [
  {
    id: "select",
    header: ({ table }) => {
      return renderComponent(DataTableCheckbox, {
        checked: table.getIsAllPageRowsSelected(),
        onCheckedChange: (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        ariaLabel: "Select all",
      });
    },
    cell: ({ row }) => {
      return renderComponent(DataTableCheckbox, {
        checked: row.getIsSelected(),
        onCheckedChange: (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        ariaLabel: "Select row",
      });
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "Device",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      return renderComponent(DeviceNameCell, {
        name: row.getValue("name"),
      });
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "Status",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      return renderComponent(DeviceStatusCell, {
        status: row.getValue("status"),
      });
    },
  },
  {
    accessorKey: "ip",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "IP Address",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      return row.getValue("ip");
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      return renderComponent(DeviceTagsCell, {
        tags: row.getValue("tags"),
      });
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return renderComponent(DeviceActionsCell, { id: row.original.id });
    },
  },
];
