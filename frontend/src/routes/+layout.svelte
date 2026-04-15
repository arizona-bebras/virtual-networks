<script lang="ts">
import { onMount } from "svelte";
import QueryProvider from "../app/providers/query-provider.svelte";
import "../app/styles/global.css";
import favicon from "$shared/assets/favicon.svg";

let { children } = $props();

onMount(() => {
  document.documentElement.classList.add("dark");
});
</script>

<svelte:head>
  <link rel="icon" href={favicon}>
  <script>
  document.documentElement.classList.add("dark");
  </script>
</svelte:head>

<div class="min-h-screen bg-background text-foreground">
  <QueryProvider>{@render children()}</QueryProvider>
</div>
