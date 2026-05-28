import {
  Activity,
  Link,
  MapPin,
  MonitorSmartphone,
  Tag,
  Tags,
  User,
  WifiSync,
} from "@lucide/svelte";
import type { ColumnDef } from "@tanstack/table-core";
import type { DeviceRelations } from "common/schemas/device/index";
import type { Tag as TagType } from "common/schemas/tag/index";
import DeviceDomainCell from "$entities/device/ui/device-domain-cell.svelte";
import DeviceNameCell from "$entities/device/ui/device-name-cell.svelte";
import DeviceStatusCell from "$entities/device/ui/device-status-cell.svelte";
import DeviceTagsCell from "$entities/device/ui/device-tags-cell.svelte";
import DataTableCheckbox from "$shared/ui/data-table/data-table-checkbox.svelte";
import DataTableSortButton from "$shared/ui/data-table/data-table-sort-button.svelte";
import { renderComponent } from "$shared/ui/data-table/index.js";
import DeviceActionsCell from "../ui/device-actions-cell.svelte";
import DeviceOwnerFilter from "../ui/device-owner-filter.svelte";
import DeviceTagsFilter from "../ui/device-tags-filter.svelte";
import type { DeviceTagsFilterValue } from "./types";

export const columns: ColumnDef<DeviceRelations>[] = [
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
    accessorKey: "name",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "Устройство",
        sort: column.getIsSorted(),
        onclick: () => {
          column.toggleSorting(column.getIsSorted() === "asc");
        },
        icon: MonitorSmartphone,
      });
    },
    cell: ({ row }) => {
      return renderComponent(DeviceNameCell, {
        name: row.getValue("name"),
      });
    },
    enableGlobalFilter: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "Статус",
        sort: column.getIsSorted(),
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        icon: WifiSync,
      });
    },
    cell: ({ row }) => {
      return renderComponent(DeviceStatusCell, {
        status: row.getValue("status"),
      });
    },
    enableGlobalFilter: false,
    size: 150,
    meta: {
      icon: Activity,
    },
  },
  {
    accessorKey: "ip",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "IP-адрес",
        sort: column.getIsSorted(),
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        icon: MapPin,
      });
    },
    cell: ({ row }) => {
      return row.getValue("ip") as string;
    },
    enableGlobalFilter: true,
    size: 150,
  },
  {
    accessorKey: "slug",
    header: ({ column }) => {
      return renderComponent(DataTableSortButton, {
        label: "Slug",
        sort: column.getIsSorted(),
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        icon: Link,
      });
    },
    cell: ({ row }) => {
      return renderComponent(DeviceDomainCell, {
        slug: row.getValue("slug"),
      });
    },
    enableGlobalFilter: false,
    size: 150,
    meta: {
      icon: Activity,
    },
  },
  {
    accessorKey: "owner",
    header: ({ column }) => {
      return renderComponent(DeviceOwnerFilter, {
        label: "Владелец",
        column,
        sort: column.getIsSorted(),
        icon: User,
      });
    },
    cell: ({ row }) => {
      const ownerName = row.original.owner?.name || "-";
      return ownerName;
    },
    enableGlobalFilter: false,
    meta: {
      icon: User,
    },
  },
  {
    accessorKey: "tags",
    header: ({ column }) => {
      return renderComponent(DeviceTagsFilter, {
        label: "Теги",
        column,
        sort: column.getIsSorted(),
        icon: Tags,
      });
    },
    cell: ({ row, column }) => {
      return renderComponent(DeviceTagsCell, {
        tags: row.original.tags,
        onclick: (name: string) => {
          const tag = row.original.tags.find((t) => t.name === name);
          if (!tag) return;
          const current =
            (column.getFilterValue() as DeviceTagsFilterValue) ?? [];
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
    filterFn: (row, columnId, filterValue: DeviceTagsFilterValue) => {
      const tags = row.getValue(columnId) as TagType[];
      if (!filterValue || filterValue.length === 0) return true;
      const filterIds = filterValue.map((f) => f.id);
      return tags.some((tag) => filterIds.includes(tag.id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return renderComponent(DeviceActionsCell, { device: row.original });
    },
    enableGlobalFilter: false,
    meta: {
      cellClass: "w-px",
      headerClass: "w-px",
    },
  },
];
