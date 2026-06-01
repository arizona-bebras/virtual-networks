<script lang="ts">
let {
  action,
  onclick,
}: { action: "create" | "update" | "delete"; onclick?: () => void } = $props();

let colorMapping = {
  create: {
    background: "bg-lime-500/25",
    decoration: "bg-lime-500",
  },
  update: {
    background: "bg-blue-500/25",
    decoration: "bg-blue-500",
  },
  delete: {
    background: "bg-red-500/25",
    decoration: "bg-red-500",
  },
};

let colorObj = $derived(colorMapping[action]);
</script>

<button
  type="button"
  class="py-1 pl-1 pr-3 {colorObj.background} rounded-[4px] flex gap-1 shrink-0 w-fit text-[12px]"
  {onclick}
>
  <div class="w-1 rounded-full {colorObj.decoration}"></div>
  <p class="my-auto">
    {action === "create" ? "Создание" : action === "update" ?  "Обновление" : "Уничтожение"}
  </p>
</button>
