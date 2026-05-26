import { FileText, Shield, Tag, Tags, Unplug } from "@lucide/svelte";
import type { ColumnDef } from "@tanstack/table-core";
import type { RuleRelation } from "common/schemas/rule/index";
import TagBadge from "$entities/tag/ui/tag-badge.svelte";
import type { FilterValueWithId } from "$features/device-management/model/types";
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
    enableGlobalFilter: false,
    size: 40,
  },
  {
    accessorKey: "description",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "Описание",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        icon: FileText,
      });
    },
    cell: ({ row }) => {
      return row.original.description || "-";
    },
    enableGlobalFilter: true,
    meta: {
      icon: FileText,
    },
  },
  {
    accessorKey: "source",
    header: ({ column }) => {
      return renderComponent(RuleTagFilter, {
        label: "Тег источника",
        column,
        icon: Tags,
      });
    },
    cell: ({ row, column }) => {
      const tag = row.original.source;
      if (!tag) return "Любой";
      return renderComponent(TagBadge, {
        tag: tag,
        onclick: () => {
          const current =
            (column.getFilterValue() as FilterValueWithId[]) ?? [];
          const next = current.some((t) => t.id === tag.id)
            ? current.filter((t) => t.id !== tag.id)
            : [...current, tag];
          column.setFilterValue(next.length > 0 ? next : undefined);
        },
      });
    },
    enableGlobalFilter: false,
    meta: {
      icon: Tag,
    },
    filterFn: (row, columnId, filterValue: FilterValueWithId[]) => {
      const tag = row.getValue(columnId) as { id: string } | null;
      if (!filterValue || filterValue.length === 0) return true;
      if (!tag) return false;
      return filterValue.some((f) => f.id === tag.id);
    },
  },
  {
    accessorKey: "dest",
    header: ({ column }) => {
      return renderComponent(RuleTagFilter, {
        label: "Тег назначения",
        column,
        icon: Tags,
      });
    },
    cell: ({ row, column }) => {
      const tag = row.original.dest;
      if (!tag) return "Любой";
      return renderComponent(TagBadge, {
        tag: tag,
        onclick: () => {
          const current =
            (column.getFilterValue() as FilterValueWithId[]) ?? [];
          const next = current.some((t) => t.id === tag.id)
            ? current.filter((t) => t.id !== tag.id)
            : [...current, tag];
          column.setFilterValue(next.length > 0 ? next : undefined);
        },
      });
    },
    enableGlobalFilter: false,
    meta: {
      icon: Tag,
    },
    filterFn: (row, columnId, filterValue: FilterValueWithId[]) => {
      const tag = row.getValue(columnId) as { id: string } | null;
      if (!filterValue || filterValue.length === 0) return true;
      if (!tag) return false;
      return filterValue.some((f) => f.id === tag.id);
    },
  },
  {
    accessorKey: "protocol",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "Протокол",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        icon: Shield,
      });
    },
    cell: ({ row }) => {
      return row.original?.protocol || "Любой";
    },
    enableGlobalFilter: true,
    meta: {
      icon: Shield,
    },
  },
  {
    accessorKey: "port",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "Порт",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        icon: Unplug,
      });
    },
    cell: ({ row }) => {
      return row.original?.port || "Любой";
    },
    enableGlobalFilter: true,
    meta: {
      icon: Unplug,
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return renderComponent(RuleActionsCell, { rule: row.original });
    },
    enableGlobalFilter: false,
    size: 50,
  },
];
