<script lang="ts" generics="TData extends { id: string }, TValue">
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash,
  X,
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
} from "@tanstack/table-core";
import { Debounced } from "runed";
import { fade } from "svelte/transition";
import { Badge } from "$shared/ui/badge/index.js";
import { Button } from "$shared/ui/button/index.js";
import { createSvelteTable, FlexRender } from "$shared/ui/data-table/index.js";
import { Input } from "$shared/ui/input/index.js";
import * as Table from "$shared/ui/table/index.js";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumn?: string;
  filterPlaceholder?: string;
  onDeleteSelected?: (selectedIds: string[]) => void;
  onGlobalFilterChange?: (value: string) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
};

let {
  data,
  columns,
  filterPlaceholder = "Filter...",
  onDeleteSelected,
  onGlobalFilterChange,
  onColumnFiltersChange,
}: DataTableProps<TData, TValue> = $props();

let sorting = $state<SortingState>([]);
let columnFilters = $state<ColumnFiltersState>([]);
let rowSelection = $state<RowSelectionState>({});
let globalFilter = $state("");
const debounced = new Debounced(() => globalFilter, 500);

$effect(() => {
  onGlobalFilterChange?.(debounced.current);
});

$effect(() => {
  onColumnFiltersChange?.(columnFilters);
});

const table = createSvelteTable({
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
    get globalFilter() {
      return globalFilter;
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
  onGlobalFilterChange: (updater) => {
    if (typeof updater === "function") {
      globalFilter = updater(globalFilter);
    } else {
      globalFilter = updater;
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

const selectedRows = $derived(table.getFilteredSelectedRowModel().rows);

function handleDeleteSelected() {
  const ids = selectedRows.map((row) => row.original.id);
  onDeleteSelected?.(ids);
  rowSelection = {};
}
</script>

<div class="space-y-4">
  <div class="flex flex-col gap-4 py-4">
    <div class="flex items-center justify-between">
      <div class="flex flex-1 items-center gap-2">
        <Input
          placeholder={filterPlaceholder}
          value={globalFilter}
          oninput={(e) => {
            globalFilter = e.currentTarget.value;
          }}
          class="max-w-sm"
        />
        {#if selectedRows.length > 0 && onDeleteSelected}
          <div in:fade={{ duration: 150 }}>
            <Button
              variant="destructive"
              size="sm"
              class="h-8 gap-1"
              onclick={handleDeleteSelected}
            >
              <Trash class="size-3.5" />
              Delete ({selectedRows.length}
              )
            </Button>
          </div>
        {/if}
      </div>
    </div>

    {#if columnFilters.length > 0}
      <div class="flex flex-wrap gap-2" in:fade>
        {#each columnFilters as filter (filter.id)}
          {@const column = table.getColumn(filter.id)}
          {@const Icon = column?.columnDef.meta?.icon}
          <Badge variant="secondary" class="h-7 gap-1 px-2 font-normal">
            {#if Icon}
              <Icon class="mr-1 size-3 text-muted-foreground" />
            {/if}
            <span class="text-muted-foreground capitalize">{filter.id}:</span>
            <span class="capitalize">{filter.value?.name ?? filter.value}</span>
            <button
              type="button"
              class="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onclick={() => table.getColumn(filter.id)?.setFilterValue(undefined)}
            >
              <X class="size-3 text-muted-foreground hover:text-foreground" />
              <span class="sr-only">Remove filter</span>
            </button>
          </Badge>
        {/each}
        <Button
          variant="ghost"
          size="sm"
          class="h-7 px-2 text-xs"
          onclick={() => table.resetColumnFilters()}
        >
          Clear all
        </Button>
      </div>
    {/if}
  </div>

  <div class="rounded-md border bg-card overflow-hidden">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head colspan={header.colSpan}>
                {#if !header.isPlaceholder}
                  <div class="flex items-center gap-2">
                    <FlexRender
                      content={header.column.columnDef.header}
                      context={header.getContext()}
                    />
                  </div>
                {/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row (row.id)}
          <tr
            class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
            data-state={row.getIsSelected() && 'selected'}
            in:fade={{ duration: 150 }}
            out:fade={{ duration: 100 }}
          >
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell>
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

  <div class="flex items-center justify-between px-2">
    <div class="flex-1 text-sm text-muted-foreground">
      {selectedRows.length} of {table.getFilteredRowModel().rows.length} row(s)
      selected.
    </div>
    <div class="flex items-center space-x-6 lg:space-x-8">
      <div class="flex items-center space-x-2">
        <p class="text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          class="hidden h-8 w-8 p-0 lg:flex"
          onclick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <span class="sr-only">Go to first page</span>
          <ChevronsLeft class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          class="h-8 w-8 p-0"
          onclick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <span class="sr-only">Go to previous page</span>
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          class="h-8 w-8 p-0"
          onclick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <span class="sr-only">Go to next page</span>
          <ChevronRight class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          class="hidden h-8 w-8 p-0 lg:flex"
          onclick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <span class="sr-only">Go to last page</span>
          <ChevronsRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</div>
