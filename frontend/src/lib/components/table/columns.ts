import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";
import {
  renderComponent,
  renderSnippet,
} from "$lib/components/ui/data-table/index.js";
import DataTableAction from "./data-table-action.svelte";

export type User = {
  id: string;
  email: string;
  tags: string[];
  deviceCount: number;
  configs: string[];
  status: string;
  lastActivity: string;
};

export const createColumns = (
  onRemove?: (id: string) => void,
): ColumnDef<User>[] => [
  {
    accessorKey: "email",
    header: "Почта",
  },
  {
    accessorKey: "tags",
    header: "Теги",
  },
  {
    accessorKey: "deviceCount",
    header: () => {
      const headerSnippet = createRawSnippet(() => {
        return {
          render: () => `<div class="text-center">Кол. устройств</div>`,
        };
      });
      return renderSnippet(headerSnippet);
    },
    cell: ({ row }) => {
      const deviceCountSnippet = createRawSnippet<[{ count: number }]>(
        (getValue) => {
          const { count } = getValue();
          return {
            render: () => `<div class="text-center">${count}</div>`,
          };
        },
      );
      return renderSnippet(deviceCountSnippet, {
        count: row.original.deviceCount,
      });
    },
  },
  {
    accessorKey: "configs",
    header: "Конфигурации",
    cell: ({ row }) => {
      const configs = row.original.configs;
      return configs.length > 0 ? configs.join(", ") : "No Configs";
    },
  },
  {
    accessorKey: "status",
    header: "Статус",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return renderComponent(DataTableAction, {
        id: row.original.id,
        onRemove,
      });
    },
  },
];
