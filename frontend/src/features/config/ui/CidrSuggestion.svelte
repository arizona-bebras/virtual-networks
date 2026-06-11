<script lang="ts">
import { ArrowRight, TriangleAlert } from "lucide-svelte";
import { slide } from "svelte/transition";
import {
  changeCidrValue,
  ipToLong,
  splitCidr,
} from "$shared/lib/cidr-operation";
import { Button } from "$shared/ui/button";

// Строка в формате 192.168.0.4/30
let { cidr = $bindable() }: { cidr: string } = $props();

const privateRanges = [
  {
    cidr: "10.0.0.0/8",
    range: "10.x.x.x",
    changedOctets: [1],
    changedValue: ["10"],
  },
  {
    cidr: "172.16.0.0/12",
    range: "172.16.x.x - 172.31.x.x",
    changedOctets: [1, 2],
    changedValue: ["172", "16"],
  },
  {
    cidr: "192.168.0.0/16",
    range: "192.168.x.x",
    changedOctets: [1, 2],
    changedValue: ["192", "168"],
  },
];

function getSubnetBounds(ip: string, mask: number) {
  const ipInt = ipToLong(ip);
  const subnetMask = mask === 0 ? 0 : (0xffffffff << (32 - mask)) >>> 0;
  const start = (ipInt & subnetMask) >>> 0;
  const end = start + 2 ** (32 - mask) - 1;

  return { start, end };
}

function isValidIpv4(ip: string) {
  const parts = ip.split(".");

  return (
    parts.length === 4 &&
    parts.every((part) => {
      if (!/^\d+$/.test(part)) return false;

      const octet = Number(part);
      return octet >= 0 && octet <= 255;
    })
  );
}

function isContainedInPrivateRange(ip: string, mask: number) {
  const subnet = getSubnetBounds(ip, mask);

  return privateRanges.some(({ cidr: privateCidr }) => {
    const { ip: rangeIp, mask: rangeMask } = splitCidr(privateCidr);
    const range = getSubnetBounds(rangeIp, Number(rangeMask));

    return subnet.start >= range.start && subnet.end <= range.end;
  });
}

function getRecommendedRange(
  cidrString: string,
): { range: string; changedOctets: number[]; changedValue: string[] } | null {
  if (!cidrString) return null;

  const { ip, mask } = splitCidr(cidrString);
  const maskInt = parseInt(mask, 10);

  if (!isValidIpv4(ip) || maskInt < 0 || maskInt > 32) return null;

  if (isContainedInPrivateRange(ip, maskInt)) return null;

  if (maskInt <= 8) return privateRanges[0]!;
  if (maskInt <= 12) return privateRanges[1]!;

  return privateRanges[2]!;
}

let recommendedRange = $derived(getRecommendedRange(cidr));

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
    class="relative mt-5 mb-2 flex w-full items-center gap-3 rounded-[20px] border border-[#FFE4A0] bg-[#FFFDF4] p-3 shadow-sm"
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
        По стандарту RFC 1918 для частных IP-адресов рекомендуется диапазон: <span
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
      class="h-8 shrink-1 rounded-lg bg-[#FFE4A0]/50 px-3 text-[12px] font-semibold text-[#2A1D00] transition-colors hover:bg-[#FFB84D]!"
    >
      <span>Применить</span>
      <ArrowRight size={14} class="ml-1.5 opacity-70" />
    </Button>
  </div>
{/if}
