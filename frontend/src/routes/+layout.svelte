<script lang="ts">
import "./layout.css";
import favicon from "$lib/assets/favicon.svg";
import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
import { SvelteQueryDevtools } from "@tanstack/svelte-query-devtools";

const queryClient = new QueryClient();

let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon}></svelte:head>
<QueryClientProvider client={queryClient}>
  {@render children()}
  {#if import.meta.env.DEV}
    <SvelteQueryDevtools />
  {/if}
</QueryClientProvider>
