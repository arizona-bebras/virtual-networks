<script lang="ts">
let { date }: { date: string } = $props();

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
</script>

<div class="text-[12px] font-medium text-foreground/80">{formatDate(date)}</div>
