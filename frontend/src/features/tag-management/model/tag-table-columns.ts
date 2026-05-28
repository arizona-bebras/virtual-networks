import { MonitorSmartphone, Palette, Tag as TagIcon } from "@lucide/svelte";
import type { ColumnDef } from "@tanstack/table-core";
import type { Tag } from "common/schemas/tag/index";
import TagColorCell from "$entities/tag/ui/tag-color-cell.svelte";
import TagCountCell from "$entities/tag/ui/tag-count-cell.svelte";
import TagNameCell from "$entities/tag/ui/tag-name-cell.svelte";
import DataTableCheckbox from "$shared/ui/data-table/data-table-checkbox.svelte";
import DataTableSortButton from "$shared/ui/data-table/data-table-sort-button.svelte";
import { renderComponent } from "$shared/ui/data-table/index.js";
import TagActionsCell from "../ui/tag-actions-cell.svelte";

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
        label: "Тег",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        icon: TagIcon,
      });
    },
    cell: ({ row }) => {
      return renderComponent(TagNameCell, {
        name: row.getValue("name"),
        // @ts-expect-error: Пока с endpint не приходит icon
        icon: row.original.icon,
        color: row.original.color,
      });
    },
  },
  {
    accessorKey: "color",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "Цвет",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        icon: Palette,
      });
    },
    cell: ({ row }) => {
      return renderComponent(TagColorCell, {
        color: row.original.color,
      });
    },
  },
  {
    accessorKey: "devicesCount",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "Кол-во устройств",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        icon: MonitorSmartphone,
      });
    },
    cell: ({ row }) => {
      return renderComponent(TagCountCell, {
        count: row.original.devicesCount,
      });
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return renderComponent(TagActionsCell, { tag: row.original });
    },
    meta: {
      cellClass: "w-px",
      headerClass: "w-px",
    },
  },
];
