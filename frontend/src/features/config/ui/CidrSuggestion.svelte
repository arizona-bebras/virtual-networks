<script lang="ts">
import { ArrowRight, TriangleAlert } from "lucide-svelte";
import { slide } from "svelte/transition";
import { changeCidrValue, splitCidr } from "$shared/lib/cidr-operation";
import { Button } from "$shared/ui/button";

// Строка в формате 192.168.0.4/30
let { cidr = $bindable() }: { cidr: string } = $props();

function getRecommendedRange(
  cidrString: string,
): { range: string; changedOctets: number[]; changedValue: string[] } | null {
  if (!cidrString) return null;

  const { ip, mask } = splitCidr(cidrString);
  const maskInt = parseInt(mask, 10);

  const ipParts = ip.split(".").map(Number) as [number, number, number, number];

  if (maskInt >= 16 && maskInt <= 24) {
    const isMatch = ipParts[0] === 192 && ipParts[1] === 168;
    return isMatch
      ? null
      : {
          range: "192.168.x.x",
          changedOctets: [1, 2],
          changedValue: ["192", "168"],
        };
  }
  if (maskInt >= 12 && maskInt <= 15) {
    const isMatch = ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31;
    return isMatch
      ? null
      : {
          range: "172.16.x.x - 172.31.x.x",
          changedOctets: [1, 2],
          changedValue: ["172", "16"],
        };
  }
  if (maskInt >= 8 && maskInt <= 11) {
    const isMatch = ipParts[0] === 10;
    return isMatch
      ? null
      : {
          range: "10.x.x.x",
          changedOctets: [1],
          changedValue: ["10"],
        };
  }

  return null;
}

function fillToFour(arr: string[], symbol = "x") {
  return arr.concat(Array(4).fill(symbol)).slice(0, 4);
}

let recommendedRange = $derived(getRecommendedRange(cidr));
let suggestedIp = $derived(
  recommendedRange ? fillToFour(recommendedRange.changedValue).join(".") : "",
);

const handleApply = () => {
  if (!recommendedRange) return;
  cidr = changeCidrValue(cidr, {
    changeArea: "ip",
    octetNumbers: recommendedRange.changedOctets,
    newValues: recommendedRange.changedValue,
  });
};
</script>

{#if recommendedRange}
  <div
    transition:slide={{ duration: 300 }}
    class="relative mt-5 mb-2 flex items-center gap-3 rounded-[20px] border border-[#FFE4A0] bg-[#FFFDF4] p-3 shadow-sm"
  >
    <div
      class="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-[50px] bg-[#FFB84D] px-2.5 py-0.5 text-[11px] font-medium text-black"
    >
      <TriangleAlert size={12} strokeWidth={2.5} />
      <span>Рекомендация</span>
    </div>

    <div
      class="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#FFE4A0] bg-[#FFFDF4]"
    >
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="h-full w-[1px] bg-[#FFE4A0]"></div>
        <div class="absolute h-[1px] w-full bg-[#FFE4A0]"></div>
      </div>
      <div class="absolute h-5 w-5 rounded-full border border-[#FFE4A0]"></div>
      <div class="absolute h-8 w-8 rounded-full border border-[#FFE4A0]"></div>
      <div
        class="absolute h-12 w-12 rounded-full border border-[#FFE4A0]"
      ></div>

      <div
        class="relative z-10 flex items-center justify-center text-[#2A1D00]"
      >
        <TriangleAlert size={24} strokeWidth={2.5} />
      </div>
    </div>

    <div class="flex-1 min-w-0">
      <h4 class="text-[13px] font-bold text-[#2A1D00]">Оптимальный диапазон</h4>
      <p class="text-[12px] text-[#2A1D00]/80 leading-tight">
        По правилам RFC 1918 для частных IP-адресов рекомендуется диапазон: <span
          class="font-semibold text-[#2A1D00]"
        >
          {recommendedRange.range}
        </span>
      </p>
    </div>

    <Button
      variant="ghost"
      size="sm"
      onclick={handleApply}
      class="h-8 shrink-0 rounded-lg bg-[#FFE4A0]/50 px-3 text-[12px] font-semibold text-[#2A1D00] transition-colors hover:bg-[#FFB84D]!"
    >
      <span>Применить {suggestedIp}</span>
      <ArrowRight size={14} class="ml-1.5 opacity-70" />
    </Button>
  </div>
{/if}
