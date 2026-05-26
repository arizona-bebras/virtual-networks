<script lang="ts">
import { ArrowLeft, Network, Plus } from "@lucide/svelte";
import AddNetworkBtn from "$features/sidebar/header/ui/new-network-dialog.svelte";
import { Button } from "$shared/ui/button/index.js";

let isDialogOpen = $state(false);
</script>

<div class="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
  <div class="relative mb-8">
    <!-- Decorative background glow -->
    <div class="absolute -inset-8 rounded-full bg-secondary/20 blur-3xl"></div>
    
    <div class="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-2xl ring-1 ring-white/20">
      <Network class="h-12 w-12" />
    </div>
  </div>

  <h1 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
    Сеть не выбрана
  </h1>
  
  <p class="max-w-[500px] text-lg text-muted-foreground mb-10">
    Выберите виртуальную сеть из списка в боковой панели или создайте новую, чтобы начать управлять своими устройствами и правилами доступа.
  </p>


</div>
