<script lang="ts">
import "./layout.css";
import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
import { SvelteQueryDevtools } from "@tanstack/svelte-query-devtools";
import { onMount } from "svelte";
import favicon from "$lib/assets/favicon.svg";

const queryClient = new QueryClient();

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
  <QueryClientProvider client={queryClient}>
    {@render children()}
    {#if import.meta.env.DEV}
      <SvelteQueryDevtools />
    {/if}
  </QueryClientProvider>
</div>
