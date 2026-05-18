<script lang="ts">
import { tick } from "svelte";
import * as Select from "$shared/ui/select/index";
import type { ValidationInfo } from "../model/types";

let { value = $bindable(), info = $bindable<ValidationInfo | null>(null) } =
  $props();

$inspect(value);

let octets = $state(["", "", "", ""]);
let maskValue = $state("24");
let maskRange = [...Array(33).keys()];

function intToIp(int: number): string {
  return [
    (int >>> 24) & 0xff,
    (int >>> 16) & 0xff,
    (int >>> 8) & 0xff,
    int & 0xff,
  ].join(".");
}

// Initialize from value prop ONLY on initial mount if provided
let isInitialized = false;
$effect(() => {
  if (value && !isInitialized) {
    const [ip, mask] = value.split("/");
    if (ip) {
      const parts = ip.split(".");
      for (let i = 0; i < 4; i++) {
        octets[i] = parts[i] || "0";
      }
    }
    if (mask) {
      maskValue = mask;
    }
    isInitialized = true;
  }
});

const numericMask = $derived(Number(maskValue));

function isOctetDisabled(index: number) {
  if (Number.isNaN(numericMask)) return false;
  if (index === 1) return numericMask <= 8;
  if (index === 2) return numericMask <= 16;
  if (index === 3) return numericMask <= 24;
  return false;
}

// Automatically reset disabled octets to "0" when mask changes
$effect(() => {
  if (!Number.isNaN(numericMask)) {
    if (numericMask <= 24 && octets[3] !== "0" && octets[3] !== "")
      octets[3] = "0";
    if (numericMask <= 16 && octets[2] !== "0" && octets[2] !== "")
      octets[2] = "0";
    if (numericMask <= 8 && octets[1] !== "0" && octets[1] !== "")
      octets[1] = "0";
  }
});

const calculatedInfo = $derived.by<ValidationInfo | null>(() => {
  if (Number.isNaN(numericMask)) {
    return {
      isValid: true,
      hostCount: 0,
      firstHost: "",
      lastHost: "",
    };
  }

  // Convert octets to a 32-bit integer
  const ipInt =
    octets.reduce((acc, oct) => {
      const val = parseInt(oct || "0", 10);
      return (acc << 8) + (val & 0xff);
    }, 0) >>> 0;

  const bitmask =
    (numericMask === 0 ? 0 : 0xffffffff << (32 - numericMask)) >>> 0;
  const netInt = (ipInt & bitmask) >>> 0;

  const isValid = (ipInt & bitmask) >>> 0 === ipInt;

  if (isValid) {
    const hostBits = 32 - numericMask;
    // Use exponentiation (**) instead of bitwise shift to avoid 32-bit signed integer overflow
    const hostCount = numericMask >= 31 ? 0 : 2 ** hostBits - 2;

    return {
      isValid: true,
      hostCount,
      firstHost: numericMask >= 31 ? "N/A" : intToIp(netInt + 1),
      lastHost:
        numericMask >= 31 ? "N/A" : intToIp(netInt + (2 ** hostBits - 2)),
    };
  } else {
    let errorOctet = -1;
    for (let i = 0; i < 4; i++) {
      const octVal = parseInt(octets[i] || "0", 10);
      const octMask = (bitmask >>> (24 - i * 8)) & 0xff;
      if ((octVal & octMask) !== octVal) {
        errorOctet = i;
        break;
      }
    }

    const lowerNet = netInt;
    const upperNet =
      (netInt + (numericMask === 0 ? 0 : 2 ** (32 - numericMask))) >>> 0;

    const getOctet = (ip: number, idx: number) =>
      (ip >>> (24 - idx * 8)) & 0xff;

    return {
      isValid: false,
      hostCount: 0,
      firstHost: "",
      lastHost: "",
      error: {
        octetIndex: errorOctet + 1,
        suggestion: {
          lower: getOctet(lowerNet, errorOctet),
          upper: getOctet(upperNet, errorOctet),
        },
      },
    };
  }
});

const calculatedValue = $derived(
  `${octets.map((o) => (o === "" ? "0" : o)).join(".")}/${maskValue}`,
);

// Sync derived state out to bindable props
$effect(() => {
  info = calculatedInfo;
  if (value !== calculatedValue) {
    value = calculatedValue;
  }
});

let inputs = $state<HTMLInputElement[]>([]);

function handleInput(index: number, e: Event) {
  const input = e.target as HTMLInputElement;
  let val = input.value;

  // Remove non-digits
  val = val.replace(/\D/g, "");

  // Remove leading zeros if there are other digits
  if (val.length > 1 && val.startsWith("0")) {
    val = val.replace(/^0+/, "");
  }

  // Limit to 3 digits
  if (val.length > 3) {
    val = val.slice(0, 3);
  }

  // Strictly enforce max 255
  const num = parseInt(val, 10);
  if (!Number.isNaN(num) && num > 255) {
    val = "255";
  }

  octets[index] = val;
  input.value = val;

  // Auto-focus next
  if (index < 3) {
    if (val.length === 3) {
      for (let next = index + 1; next < 4; next++) {
        if (!isOctetDisabled(next)) {
          inputs[next]?.focus();
          inputs[next]?.select();
          break;
        }
      }
    }
  }
}

function handleKeydown(index: number, e: KeyboardEvent) {
  if (e.key === "." || e.key === " " || e.key === "Enter") {
    if (index < 3 && octets[index] !== "") {
      e.preventDefault();
      for (let next = index + 1; next < 4; next++) {
        if (!isOctetDisabled(next)) {
          inputs[next]?.focus();
          inputs[next]?.select();
          break;
        }
      }
    }
  } else if (
    e.key === "Backspace" &&
    (octets[index] === "" || octets[index] === null) &&
    index > 0
  ) {
    e.preventDefault();
    for (let prev = index - 1; prev >= 0; prev--) {
      if (!isOctetDisabled(prev)) {
        inputs[prev]?.focus();
        inputs[prev]?.select();
        break;
      }
    }
  }
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
        disabled={isOctetDisabled(i)}
        oninput={(e) => handleInput(i, e)}
        onkeydown={(e) => handleKeydown(i, e)}
        placeholder={([192, 168, 1, 0][i] ?? 0).toString()}
        min="0"
        max="255"
        class="octet-input w-8 text-center bg-transparent border-none outline-none {!info?.isValid && info?.error?.octetIndex === i + 1 ? 'text-destructive' : ''} placeholder:text-slate-400 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:text-slate-400 disabled:cursor-not-allowed"
      >
      {#if i < 3}
        <span class="text-slate-400 font-bold select-none">.</span>
      {/if}
    {/each}
  </div>
  <div class="flex gap-1 border-l">
    <Select.Root type="single" bind:value={maskValue}>
      <Select.Trigger class="w-[80px] border-none bg-transparent! focus:ring-0">
        {maskValue ? `/${maskValue}` : 'Mask'}
      </Select.Trigger>
      <Select.Content class="max-h-[300px]">
        {#each maskRange as mask}
          <Select.Item value={mask.toString()}>{mask}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
  </div>
</div>
