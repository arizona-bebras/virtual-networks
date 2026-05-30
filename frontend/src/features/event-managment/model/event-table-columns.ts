import { Activity, Box, Clock, User } from "@lucide/svelte";
import type { ColumnDef } from "@tanstack/table-core";
import type { Device } from "common/schemas/device/index";
import type { NetworkUser } from "common/schemas/network/network-users";
import type { Rule } from "common/schemas/rule/index";
import type { Tag as TagType } from "common/schemas/tag/index";
import EntityCell from "$features/event-managment/ui/event-entity-cell.svelte";
import TimeCell from "$features/event-managment/ui/event-time-cell.svelte";
import DataTableCheckbox from "$shared/ui/data-table/data-table-checkbox.svelte";
import DataTableSortButton from "$shared/ui/data-table/data-table-sort-button.svelte";
import { renderComponent } from "$shared/ui/data-table/index.js";

// TODO: убрать, после реализации типа на backend
export type Event = {
  id: string;
  user: NetworkUser;
  event: string;
  entities: Device | Rule | TagType;
  time: string;
};

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
    accessorKey: "event",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "Действие",
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
