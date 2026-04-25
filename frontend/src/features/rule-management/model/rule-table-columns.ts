import type { ColumnDef } from "@tanstack/table-core";
import DataTableCheckbox from "$shared/ui/data-table/data-table-checkbox.svelte";
import DataTableSortButton from "$shared/ui/data-table/data-table-sort-button.svelte";
import { renderComponent } from "$shared/ui/data-table/index.js";
import RuleActionsCell from "../ui/rule-actions-cell.svelte";

export interface RuleMock {
  id: string;
  description: string;
  sourceTag: string;
  destTag: string;
  protocol: string;
  port: number | string;
}

export const columns: ColumnDef<RuleMock>[] = [
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
    accessorKey: "description",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "Description",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      return row.getValue("description");
    },
  },
  {
    accessorKey: "sourceTag",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "Source Tag",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      return row.getValue("sourceTag");
    },
  },
  {
    accessorKey: "destTag",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "Destination Tag",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      return row.getValue("destTag");
    },
  },
  {
    accessorKey: "protocol",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "Protocol",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      return (row.getValue("protocol") as string).toUpperCase();
    },
  },
  {
    accessorKey: "port",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "Port",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      return row.getValue("port") || "Any";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return renderComponent(RuleActionsCell, { rule: row.original });
    },
  },
];
