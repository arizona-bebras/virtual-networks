<script lang="ts">
import { onMount, untrack } from "svelte";
import { splitCidr, validateNetworkCidr } from "$shared/lib/cidr-operation";
import type { ValidationResult } from "../model/types";
import IpInput from "./IpInput.svelte";
import MaskSelector from "./MaskSelector.svelte";

let {
  value = $bindable(),
  info = $bindable(),
}: {
  value: string;
  info: ValidationResult | null;
} = $props();

const initialSplit = splitCidr(value);
let selectedMask = $state(initialSplit.mask);
let ipPart = $state(initialSplit.ip);

$effect(() => {
  const split = splitCidr(value);
  untrack(() => {
    if (ipPart !== split.ip) ipPart = split.ip;
    if (selectedMask !== split.mask) selectedMask = split.mask;
  });
});

$effect(() => {
  const newVal = `${ipPart}/${selectedMask}`;
  untrack(() => {
    if (value !== newVal) value = newVal;
  });
});

onMount(() => {
  handleMaskChange(selectedMask);
});

function handleMaskChange(mask: string) {
  const currentMask = parseInt(mask, 10);
  const octetsArr = ipPart.split(".");
  for (let i = 3; i > 0; i--) {
    if (currentMask <= i * 8) {
      octetsArr[i] = "0";
    }
  }
  ipPart = octetsArr.join(".");
  selectedMask = mask;
}
</script>

<div class="flex font-medium text-[12px] mb-1 gap-0.5">
  <p>CIDR</p>
  <p class="text-destructive">*</p>
</div>
<div
  class="mb-2 flex justify-between gap-2 rounded-[6px] border border-input bg-input/30 transition-colors outline-none focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50 {info && !info.isValid ? 'border-destructive ring-1 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40' : ''}"
>
  <IpInput
    bind:ip={ipPart}
    mask={selectedMask}
    bind:info
    validate={() => validateNetworkCidr(value)}
  />
  <div class="flex gap-1 border-l">
    <MaskSelector bind:selectedMask onMaskChange={handleMaskChange} />
  </div>
</div>
