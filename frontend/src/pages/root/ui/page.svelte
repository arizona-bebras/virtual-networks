<script lang="ts">
import { onMount } from "svelte";
import { goto } from "$app/navigation";

onMount(() => {
  const token = localStorage.getItem("token");
  goto(token ? "/app/dashboard" : "/auth/login");
});
</script>

<div class="flex h-screen items-center justify-center">
  <p class="text-muted-foreground animate-pulse">Redirecting...</p>
</div>
