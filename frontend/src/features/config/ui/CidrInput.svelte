<script lang="ts">
import { onMount } from "svelte";
import { changeCidrValue } from "$shared/lib/cidr-operation";
import * as Select from "$shared/ui/select/index";
import type { ValidationResult } from "../model/types";

let {
  value = $bindable(),
  info = $bindable(),
}: {
  value: string;
  info: ValidationResult | null;
} = $props();

let octets = $derived(value.split(/[./]/).slice(0, 4).map(Number));
let selectedMask = $state(value.split("/")[1] ?? "");
let maskRange = $derived(Array.from({ length: 32 }, (_, i) => i + 1));
let inputs: HTMLInputElement[] = $state([]);

onMount(() => {
  info = fillNetworkInfo();
  blockOctetInput(selectedMask);
});

function fillNetworkInfo(): ValidationResult {
  const mask = parseInt(selectedMask, 10);
  const ipInt =
    ((octets[0]! << 24) |
      (octets[1]! << 16) |
      (octets[2]! << 8) |
      octets[3]!) >>>
    0;
  const subnetMask = mask === 0 ? 0 : (~0 << (32 - mask)) >>> 0;

  const networkInt = (ipInt & subnetMask) >>> 0;
  const totalIps = 2 ** (32 - mask);
  const isNetworkValid = ipInt === networkInt;

  if (isNetworkValid) {
    let firstHostInt: number, lastHostInt: number;

    if (mask === 32) {
      firstHostInt = networkInt;
      lastHostInt = networkInt;
    } else if (mask === 31) {
      firstHostInt = networkInt;
      lastHostInt = networkInt + totalIps - 1;
    } else {
      firstHostInt = networkInt + 1;
      lastHostInt = networkInt + totalIps - 2;
    }

    const intToIp = (int: number) => {
      return [
        (int >>> 24) & 255,
        (int >>> 16) & 255,
        (int >>> 8) & 255,
        int & 255,
      ].join(".");
    };

    return {
      isValid: true,
      hostCount: totalIps,
      firstHost: intToIp(firstHostInt),
      lastHost: intToIp(lastHostInt),
    };
  } else {
    const netOctets = [
      (networkInt >>> 24) & 255,
      (networkInt >>> 16) & 255,
      (networkInt >>> 8) & 255,
      networkInt & 255,
    ];

    let octetIndex = 3;
    for (let i = 0; i < 4; i++) {
      if (octets[i] !== netOctets[i]) {
        octetIndex = i;
        break;
      }
    }
    const bitsInOctet = Math.max(0, Math.min(8, mask - octetIndex * 8));
    const step = 2 ** (8 - bitsInOctet);

    const currentNetValue = netOctets[octetIndex]!;
    const lowerSuggestion = currentNetValue;
    const upperSuggestion =
      currentNetValue + step >= 255 ? -1 : currentNetValue + step;

    return {
      isValid: false,
      error: {
        octetIndex: octetIndex + 1,
        suggestion: {
          lower: lowerSuggestion,
          upper: upperSuggestion,
        },
      },
    };
  }
}

function inputHandler(e: Event, i: number) {
  const target = e.target as HTMLInputElement;
  let inputValue = target.value ? parseInt(target.value, 10) : 0;

  if (inputValue.toString().length >= 3) {
    if (inputValue > 255) {
      inputValue = 255;
      target.value = inputValue.toString();
    }
    inputs[i + 1]?.focus();
    inputs[i + 1]?.select();
  }

  value = changeCidrValue(value, {
    changeArea: "ip",
    octetNumbers: [i + 1],
    newValues: [inputValue.toString()],
  });
  info = fillNetworkInfo();
}

function blockOctetInput(mask: string) {
  if (inputs.length !== 4) {
    return;
  }
  const currentMask = parseInt(mask, 10);
  for (let i = 3; i > 0; i--) {
    inputs[i]!.disabled =
      currentMask <= i * 8
        ? (() => {
            value = changeCidrValue(value, {
              changeArea: "ip",
              octetNumbers: [i + 1],
              newValues: ["0"],
            });
            return true;
          })()
        : false;
  }
  info = fillNetworkInfo();
  value = changeCidrValue(value, {
    changeArea: "mask",
    newValue: mask,
  });
}
</script>

<div
  class="flex bg-input/50 border gap-2 justify-between transition-colors focus-within:ring-2 focus-within:ring-offset-2 {info?.isValid ? 'border-slate-200 focus-within:ring-slate-950' : 'border-destructive/40 focus-within:ring-red-500'} mb-2"
>
  <div class="flex items-center px-2 py-1" id="ip-container">
    {#each octets as octet, i}
      <input
        type="number"
        bind:this={inputs[i]}
        value={octet}
        placeholder={([192, 168, 1, 0][i] ?? 0).toString()}
        oninput={(e) => inputHandler(e, i)}
        min="0"
        max="255"
        maxLength={3}
        class="octet-input w-8 text-center bg-transparent border-none outline-none {!info?.isValid && info?.error?.octetIndex === i + 1 ? 'text-destructive' : ''} placeholder:text-slate-400 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:text-slate-400 disabled:cursor-not-allowed"
      >
      {#if i < 3}
        <span class="text-slate-400 font-bold select-none">.</span>
      {/if}
    {/each}
  </div>
  <div class="flex gap-1 border-l">
    <Select.Root
      type="single"
      bind:value={selectedMask}
      onValueChange={(value: string) => blockOctetInput(value)}
    >
      <Select.Trigger class="w-[80px] border-none bg-transparent! focus:ring-0">
        {selectedMask ? `/${selectedMask}` : 'Маска'}
      </Select.Trigger>
      <Select.Content class="max-h-[300px]">
        {#each maskRange as mask}
          <Select.Item value={mask.toString()}>{mask}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
  </div>
</div>
