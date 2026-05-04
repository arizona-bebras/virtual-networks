import { RowData } from "@tanstack/table-core";
import type { Component } from "svelte";

declare module "@tanstack/table-core" {
  interface ColumnMeta<TData extends RowData, TValue> {
    icon?: Component;
  }
}

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}
