<script lang="ts">
import {
  type validateHostIP,
  validateNetworkCidr,
} from "$shared/lib/cidr-operation";
import type { ValidationResult } from "../model/types";

let {
  ip = $bindable(),
  mask,
  info = $bindable(),
  validate,
}: {
  ip: string;
  mask?: string;
  info: ValidationResult | null;
  validate: () => ValidationResult;
} = $props();

const octets = $derived(ip.split(".").map(Number));

$effect(() => {
  info = validate();
});

let inputs: HTMLInputElement[] = $state([]);

function backspaceHandler(e: KeyboardEvent, i: number) {
  if (e.key !== "Backspace") return;
  const target = e.target as HTMLInputElement;
  if (target.value === "") {
    inputs[i - 1]?.focus();
    e.preventDefault();
  }
}

function inputHandler(e: Event, i: number) {
  const target = e.target as HTMLInputElement;
  let inputValue = target.value ? parseInt(target.value, 10) : 0;
  const octetsArr = ip.split(".");

  if (inputValue.toString().length >= 3) {
    if (inputValue > 255) {
      inputValue = 255;
      target.value = inputValue.toString();
    }
    inputs[i + 1]?.focus();
    inputs[i + 1]?.select();
  } else if (octetsArr[i] === "0" && target.value === "") {
    inputs[i - 1]?.focus();
    inputs[i - 1]?.select();
  }

  octetsArr[i] = inputValue.toString();
  ip = octetsArr.join(".");
}

let disabledStates = $derived.by(() => {
  if (!mask) return [false, false, false, false];
  const maskInt = parseInt(mask, 10);
  return [0, 1, 2, 3].map((i) => i > 0 && maskInt <= i * 8);
});
</script>

<div class="flex items-center px-2 py-1" id="ip-container">
  {#each octets as octet, i}
    <input
      type="number"
      bind:this={inputs[i]}
      value={octet}
      placeholder={([192, 168, 1, 0][i] ?? 0).toString()}
      oninput={(e) => inputHandler(e, i)}
      onkeydown={(e) => backspaceHandler(e, i)}
      min="0"
      max="255"
      maxLength={3}
      disabled={disabledStates[i]}
      class="octet-input w-8 text-center bg-transparent border-none outline-none {!info?.isValid && info?.error?.octetIndex === i + 1 ? 'text-destructive' : ''} placeholder:text-slate-400 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:text-slate-400 disabled:cursor-not-allowed"
    >
    {#if i < 3}
      <span class="text-slate-400 font-bold select-none">.</span>
    {/if}
  {/each}
</div>
