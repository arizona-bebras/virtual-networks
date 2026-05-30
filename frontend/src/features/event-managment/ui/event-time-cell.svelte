<script lang="ts">
let { date }: { date: string } = $props();

function formatDate(dateString: string) {
  const d = new Date(dateString);
  const day = d.getDate();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}`;
}
</script>

<div class="text-[12px]">{formatDate(date)}</div>
