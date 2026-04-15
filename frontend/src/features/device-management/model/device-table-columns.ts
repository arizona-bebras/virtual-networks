import type { ColumnDef } from "@tanstack/table-core";
import type { Device } from "$entities/device/model/types.js";
import DeviceNameCell from "$entities/device/ui/device-name-cell.svelte";
import DeviceStatusCell from "$entities/device/ui/device-status-cell.svelte";
import DeviceTagsCell from "$entities/device/ui/device-tags-cell.svelte";
import DataTableCheckbox from "$shared/ui/data-table/data-table-checkbox.svelte";
import DataTableSortButton from "$shared/ui/data-table/data-table-sort-button.svelte";
import { renderComponent } from "$shared/ui/data-table/index.js";
import DeviceActionsCell from "../ui/device-actions-cell.svelte";

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
