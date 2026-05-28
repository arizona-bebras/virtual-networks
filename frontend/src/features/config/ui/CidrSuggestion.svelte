<script lang="ts">
import type { NumberValue } from "d3-scale";
import { changeCidrValue, splitCidr } from "$shared/lib/cidr-operation";

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

// biome-ignore lint/correctness/noUnusedVariables: <Залог на будущее. Предлагать второй октет случайным образов для маски 12-15, с учётом валидации>
function getRandomInt(min: number, max: number): number {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max + 1);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

function fillToFour(arr: string[], symbol = "x") {
  return arr.concat(Array(4).fill(symbol)).slice(0, 4);
}

let recommendedRange = $derived(getRecommendedRange(cidr));
</script>

{#if recommendedRange}
  <div class="text-orange-500">
    <p>Рекомендуется использовать серый диапазон: {recommendedRange.range}</p>
    <button
      type="button"
      onclick={() => cidr = changeCidrValue(cidr, {changeArea: "ip", octetNumbers: recommendedRange.changedOctets, newValues: recommendedRange.changedValue})}
      class="bg-white p-1 rounded-[4px]"
    >
      Заменить ip на {fillToFour(recommendedRange.changedValue).join('.')}
    </button>
  </div>
{/if}
