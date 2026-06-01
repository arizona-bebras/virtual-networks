import {
  Activity,
  Box,
  Calendar,
  Clock,
  SlidersHorizontal,
  User,
} from "@lucide/svelte";
import type { ColumnDef } from "@tanstack/table-core";

import type { Event } from "common/schemas/event/index";

import EventCell from "$features/event-managment/ui/event-action-cell.svelte";
import EventColumnFilter from "$features/event-managment/ui/event-column-filter.svelte";
import DateCell from "$features/event-managment/ui/event-date-cell.svelte";
import DescriptionCell from "$features/event-managment/ui/event-description-cell.svelte";
import EntityCell from "$features/event-managment/ui/event-entity-cell.svelte";
import TimeOnlyCell from "$features/event-managment/ui/event-time-only-cell.svelte";
import DataTableCheckbox from "$shared/ui/data-table/data-table-checkbox.svelte";
import DataTableSortButton from "$shared/ui/data-table/data-table-sort-button.svelte";
import { renderComponent } from "$shared/ui/data-table/index.js";

export const columns: ColumnDef<Event>[] = [
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
    accessorKey: "date",
    id: "date",
    header: ({ column }) => {
      return renderComponent(EventColumnFilter, {
        column,
        label: "Дата",
        sort: column.getIsSorted(),
        icon: Calendar,
        type: "date",
      });
    },
    cell: ({ row }) => {
      return renderComponent(DateCell, {
        date: row.original.time,
      });
    },
    accessorFn: (row) => row.time,
    enableGlobalFilter: false,
    size: 110,
    meta: {
      icon: Calendar,
    },
  },
  {
    accessorKey: "time",
    id: "time",
    header: ({ column }) => {
      return renderComponent(EventColumnFilter, {
        column,
        label: "Время",
        sort: column.getIsSorted(),
        icon: Clock,
        type: "time",
      });
    },
    cell: ({ row }) => {
      return renderComponent(TimeOnlyCell, {
        date: row.original.time,
      });
    },
    accessorFn: (row) => row.time,
    enableGlobalFilter: false,
    size: 100,
    meta: {
      icon: Clock,
    },
  },
  {
    accessorKey: "user",
    header: ({ column }) => {
      return renderComponent(EventColumnFilter, {
        column,
        label: "Пользователь",
        sort: column.getIsSorted(),
        icon: User,
      });
    },
    cell: ({ row }) => {
      return row.original.user.name;
    },
    enableGlobalFilter: true,
  },
  {
    accessorKey: "action",
    header: ({ column }) => {
      return renderComponent(EventColumnFilter, {
        column,
        label: "Действие",
        sort: column.getIsSorted(),
        icon: SlidersHorizontal,
      });
    },
    cell: ({ row }) => {
      return renderComponent(EventCell, {
        action: row.original.action.type,
      });
    },
    enableGlobalFilter: false,
    size: 150,
    meta: {
      icon: Activity,
    },
  },
  {
    accessorKey: "event",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "Описание",
        sort: column.getIsSorted(),
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        icon: Activity,
      });
    },
    cell: ({ row }) => {
      return renderComponent(DescriptionCell, {
        action: row.original.action,
      });
    },
    enableGlobalFilter: false,
    size: 150,
    meta: {
      icon: Activity,
    },
  },
  {
    accessorKey: "entities",
    header: ({ column }) => {
      return renderComponent(EventColumnFilter, {
        column,
        label: "Сущность",
        sort: column.getIsSorted(),
        icon: Box,
      });
    },
    cell: ({ row }) => {
      return renderComponent(EntityCell, {
        entity: row.original.entities,
      });
    },
    enableGlobalFilter: true,
    size: 150,
  },
];
