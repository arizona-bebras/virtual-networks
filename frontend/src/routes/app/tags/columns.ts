import type { ColumnDef } from "@tanstack/table-core";
import DataTableCheckbox from "$lib/components/table/data-table-checkbox.svelte";
import DataTableSortButton from "$lib/components/table/data-table-sort-button.svelte";
import { renderComponent } from "$lib/components/ui/data-table/index.js";
import TagActionsCell from "./TagActionsCell.svelte";
import TagColorCell from "./TagColorCell.svelte";
import TagCountCell from "./TagCountCell.svelte";
import TagNameCell from "./TagNameCell.svelte";

export type Tag = {
  id: string;
  name: string;
  // biome-ignore lint/suspicious/noExplicitAny: Component typing in Svelte 5 can be complex with library components
  icon: any;
  color: string;
  count: number;
};

export const columns: ColumnDef<Tag>[] = [
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
        label: "Tag",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      return renderComponent(TagNameCell, {
        name: row.getValue("name"),
        icon: row.original.icon,
        color: row.original.color,
      });
    },
  },
  {
    accessorKey: "color",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "Color",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      return renderComponent(TagColorCell, {
        color: row.getValue("color"),
      });
    },
  },
  {
    accessorKey: "count",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "Device Count",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      return renderComponent(TagCountCell, {
        count: row.getValue("count"),
      });
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return renderComponent(TagActionsCell, { id: row.original.id });
    },
  },
];
