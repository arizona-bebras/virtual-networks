import type { ColumnDef } from "@tanstack/table-core";

/**
 * Injects an onDelete callback into the 'actions' column of a ColumnDef array.
 */
export function withRowActions<TData extends { id: string }>(
  columns: ColumnDef<TData, unknown>[],
  onDelete: (id: string) => void,
): ColumnDef<TData, unknown>[] {
  return columns.map((col) => {
    if (col.id === "actions") {
      return {
        ...col,
        cell: (context) => {
          const originalCell = col.cell;
          const componentObj =
            typeof originalCell === "function"
              ? (originalCell as (value: typeof context) => unknown)(context)
              : originalCell;

          if (
            componentObj &&
            typeof componentObj === "object" &&
            "props" in componentObj
          ) {
            (componentObj.props as { onDelete?: () => void }).onDelete = () =>
              onDelete(context.row.original.id);
          }
          return componentObj;
        },
      } as ColumnDef<TData, unknown>;
    }
    return col;
  });
}
