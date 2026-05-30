import { Activity, Box, Clock, SlidersHorizontal, User } from "@lucide/svelte";
import type { ColumnDef } from "@tanstack/table-core";

import type { Event } from "common/schemas/event/index";

import EventCell from "$features/event-managment/ui/event-action-cell.svelte";
import EntityCell from "$features/event-managment/ui/event-entity-cell.svelte";
import TimeCell from "$features/event-managment/ui/event-time-cell.svelte";
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
    accessorKey: "time",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "Время",
        sort: column.getIsSorted(),
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        icon: Clock,
      });
    },
    cell: ({ row }) => {
      return renderComponent(TimeCell, {
        date: row.original.time,
      });
    },
    enableGlobalFilter: false,
    size: 150,
    meta: {
      icon: Clock,
    },
  },
  {
    accessorKey: "user",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "Пользователь",
        sort: column.getIsSorted(),
        onclick: () => {
          column.toggleSorting(column.getIsSorted() === "asc");
        },
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
      return renderComponent(DataTableSortButton, {
        label: "Действие",
        sort: column.getIsSorted(),
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        icon: SlidersHorizontal,
      });
    },
    cell: ({ row }) => {
      return renderComponent(EventCell, {
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
      return row.original.event;
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
      return renderComponent(DataTableSortButton, {
        label: "Сущность",
        sort: column.getIsSorted(),
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
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

  // {
  //   id: "actions",
  //   cell: ({ row }) => {
  //     return renderComponent(DeviceActionsCell, { device: row.original });
  //   },
  //   enableGlobalFilter: false,
  //   meta: {
  //     cellClass: "w-px",
  //     headerClass: "w-px",
  //   },
  // },
];
