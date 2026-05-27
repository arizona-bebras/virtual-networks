<script lang="ts" generics="TData extends { id: string }, TValue">
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "@lucide/svelte";
import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type SortingState,
  type Table as TableType,
} from "@tanstack/table-core";
import { fade } from "svelte/transition";
import { Button } from "$shared/ui/button/index.js";
import { createSvelteTable, FlexRender } from "$shared/ui/data-table/index.js";
import * as Table from "$shared/ui/table/index.js";
import DataTableFilters from "./data-table-filters.svelte";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  selectedIds?: string[];
  table?: TableType<TData>;
  showFilters?: boolean;
};

let {
  data,
  columns,
  onColumnFiltersChange,
  selectedIds = $bindable([]),
  table = $bindable(),
}: DataTableProps<TData, TValue> = $props();

let sorting = $state<SortingState>([]);
let columnFilters = $state<ColumnFiltersState>([]);
let rowSelection = $state<RowSelectionState>({});

$effect(() => {
  onColumnFiltersChange?.(columnFilters);
});

const tableInstance = createSvelteTable({
  get data() {
    return data;
  },
  get columns() {
    return columns;
  },
  state: {
    get sorting() {
      return sorting;
    },
    get columnFilters() {
      return columnFilters;
    },
    get rowSelection() {
      return rowSelection;
    },
  },
  manualFiltering: true,
  enableRowSelection: true,
  onSortingChange: (updater) => {
    if (typeof updater === "function") {
      sorting = updater(sorting);
    } else {
      sorting = updater;
    }
  },
  onColumnFiltersChange: (updater) => {
    if (typeof updater === "function") {
      columnFilters = updater(columnFilters);
    } else {
      columnFilters = updater;
    }
  },
  onRowSelectionChange: (updater) => {
    if (typeof updater === "function") {
      rowSelection = updater(rowSelection);
    } else {
      rowSelection = updater;
    }
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
});

$effect.pre(() => {
  table = tableInstance;
});

const selectedRows = $derived(tableInstance.getFilteredSelectedRowModel().rows);

$effect(() => {
  selectedIds = selectedRows.map((row) => row.original.id);
});

$effect(() => {
  if (selectedIds.length === 0 && Object.keys(rowSelection).length > 0) {
    rowSelection = {};
  }
});
</script>

<div class="space-y-4">
  <div class="rounded-md border bg-card overflow-hidden">
    <Table.Root>
      <Table.Header>
        {#each tableInstance.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head
                colspan={header.colSpan}
                class="border border-border p-0 bg-accent {header.column.columnDef
                  .meta?.headerClass ?? ''}"
              >
                {#if !header.isPlaceholder}
                  <FlexRender
                    content={header.column.columnDef.header}
                    context={header.getContext()}
                  />
                {/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each tableInstance.getRowModel().rows as row (row.id)}
          <tr
            class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
            data-state={row.getIsSelected() && 'selected'}
            in:fade={{ duration: 150 }}
            out:fade={{ duration: 100 }}
          >
            {#each row.getVisibleCells() as cell (cell.id)}
              <!-- Убирем отступы у ячейки с checkbox -->
              <Table.Cell
                class="border-y border-border/65 {cell.id.includes('select')
                  ? 'p-0'
                  : ''} {cell.column.columnDef.meta?.cellClass ?? ''}"
              >
                <FlexRender
                  content={cell.column.columnDef.cell}
                  context={cell.getContext()}
                />
              </Table.Cell>
            {/each}
          </tr>
        {:else}
          <Table.Row>
            <Table.Cell colspan={columns.length} class="h-24 text-center">
              No results.
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>

  <div class="flex items-center justify-end px-2">
    <!-- <div class="flex-1 text-sm text-muted-foreground">
      {selectedRows.length} из {tableInstance.getFilteredRowModel().rows.length} столбцов
      выбрано.
    </div> -->
    <div class="flex items-center space-x-6 lg:space-x-8">
      <div class="flex items-center space-x-2">
        <p class="text-sm font-medium">
          Страница {tableInstance.getState().pagination.pageIndex + 1} из {tableInstance.getPageCount()}
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          class="hidden h-8 w-8 p-0 lg:flex"
          onclick={() => tableInstance.setPageIndex(0)}
          disabled={!tableInstance.getCanPreviousPage()}
        >
          <span class="sr-only">Go to first page</span>
          <ChevronsLeft class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          class="h-8 w-8 p-0"
          onclick={() => tableInstance.previousPage()}
          disabled={!tableInstance.getCanPreviousPage()}
        >
          <span class="sr-only">Go to previous page</span>
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          class="h-8 w-8 p-0"
          onclick={() => tableInstance.nextPage()}
          disabled={!tableInstance.getCanNextPage()}
        >
          <span class="sr-only">Go to next page</span>
          <ChevronRight class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          class="hidden h-8 w-8 p-0 lg:flex"
          onclick={() => tableInstance.setPageIndex(tableInstance.getPageCount() - 1)}
          disabled={!tableInstance.getCanNextPage()}
        >
          <span class="sr-only">Go to last page</span>
          <ChevronsRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</div>
