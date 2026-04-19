<script lang="ts">
import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
import { SvelteQueryDevtools } from "@tanstack/svelte-query-devtools";

const queryClient = new QueryClient();

let { children } = $props();
</script>

<QueryClientProvider client={queryClient}>
  {@render children()}
  {#if import.meta.env.DEV}
    <SvelteQueryDevtools />
  {/if}
</QueryClientProvider>
