import { ArrowUpDown, Tag } from "@lucide/svelte";
import type { ColumnDef } from "@tanstack/table-core";
import type { RuleRelation } from "common/schemas/rule/index";
import TagBadge from "$entities/tag/ui/tag-badge.svelte";
import DataTableCheckbox from "$shared/ui/data-table/data-table-checkbox.svelte";
import DataTableSortButton from "$shared/ui/data-table/data-table-sort-button.svelte";
import { renderComponent } from "$shared/ui/data-table/index.js";
import RuleActionsCell from "../ui/rule-actions-cell.svelte";
import RuleTagFilter from "../ui/rule-tag-filter.svelte";

export const columns: ColumnDef<RuleRelation>[] = [
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
      return row.original.description || "";
    },
  },
  {
    accessorKey: "sourceTag",
    header: ({ column }) => {
      return renderComponent(RuleTagFilter, {
        label: "Source Tag",
        column,
      });
    },
    cell: ({ row }) => {
      const tag = row.original.source;
      if (!tag) return "Any";
      return renderComponent(TagBadge, { tag: tag });
    },
    meta: {
      icon: Tag,
    },
  },
  {
    accessorKey: "destTag",
    header: ({ column }) => {
      return renderComponent(RuleTagFilter, {
        label: "Destination Tag",
        column,
      });
    },
    cell: ({ row }) => {
      const tag = row.original.dest;
      if (!tag) return "Any";
      return renderComponent(TagBadge, { tag: tag });
    },
    meta: {
      icon: Tag,
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
      return row.original?.protocol || "Any";
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
      return row.original?.port || "Any";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return renderComponent(RuleActionsCell, { rule: row.original });
    },
  },
];
