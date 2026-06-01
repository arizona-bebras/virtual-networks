<script lang="ts">
let { date }: { date: string } = $props();

function formatTime(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<div class="text-[12px] text-muted-foreground">{formatTime(date)}</div>
