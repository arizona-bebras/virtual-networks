<script lang="ts">
import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/svelte-query";
import { UpdateNetworkSchema } from "common/schemas/network/update-network";
import { untrack } from "svelte";
import { goto } from "$app/navigation";
import type { ValidationResult } from "$features/config/model/types";
import CidrInput from "$features/config/ui/CidrInput.svelte";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import * as Card from "$shared/ui/card/index.js";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import * as InputOTP from "$shared/ui/input-otp";
import * as Select from "$shared/ui/select/index.js";
import { Separator } from "$shared/ui/separator/index.js";
import {
  networkConfig,
  networkDeletionMutation,
  networkUpdateMutation,
} from "../api/query";

const queryClient = useQueryClient();
let networkId = $derived(getNetworkId().id);
let networkCfg = createQuery(() => networkConfig(networkId));
let cidrFieldInfo: ValidationResult | null = $state(null);

const updateMutation = createMutation(() =>
  networkUpdateMutation(() => {
    queryClient.invalidateQueries({ queryKey: ["networkConfig", networkId] });
    queryClient.invalidateQueries({ queryKey: ["userNetworks"] });
  }),
);

const deleteMutation = createMutation(() =>
  networkDeletionMutation(() => {
    queryClient.invalidateQueries({ queryKey: ["networkConfig", networkId] });
    queryClient.invalidateQueries({ queryKey: ["userNetworks"] });
    goto("/app");
  }),
);

let {
  forms: form,
  formData,
  valid,
  enhance,
} = useForm(UpdateNetworkSchema, {
  onSubmit: async () => {
    updateMutation.mutate({
      networkId,
      networkInfo: {
        name: $formData.name,
        cidr: $formData.cidr,
        description: $formData.description,
      },
    });
  },
});

$effect(() => {
  if (networkCfg.isSuccess && networkCfg.data) {
    untrack(() => {
      $formData.name = networkCfg?.data?.name;
      $formData.cidr = networkCfg?.data?.cidr;
      $formData.description = networkCfg?.data?.description;
    });
  }
});

function handleDelete() {
  if (
    confirm(
      "Are you sure you want to delete this network? This action cannot be undone.",
    )
  ) {
    deleteMutation.mutate(networkId);
  }
}
</script>

{#if networkCfg.isSuccess && $formData.cidr}
  <div class="mx-auto max-w-2xl p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight">Network Configuration</h1>
      <p class="text-muted-foreground">
        Configure your virtual network settings.
      </p>
    </div>

    <Card.Root>
      <Card.Header>
        <Card.Title>General Settings</Card.Title>
        <Card.Description>
          Update your network name and address space.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <form method="POST" use:enhance class="space-y-6">
          <Form.Field {form} name="name">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label>Network Name</Form.Label>
                <Input {...props} bind:value={$formData.name} />
              {/snippet}
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>

          <!-- <Form.Field {form} name="cidr">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Network CIDR</Form.Label>
              <Input {...props} bind:value={$formData.cidr} />
              <p class="mt-1 text-xs text-muted-foreground">
                The IP range for this network (e.g. 10.0.0.0/24).
              </p>
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field> -->
          <div>
            <CidrInput bind:value={$formData.cidr} bind:info={cidrFieldInfo} />
            {#if cidrFieldInfo}
              {#if cidrFieldInfo?.isValid}
                <p>
                  Диапазон хостов: {cidrFieldInfo.firstHost} - {cidrFieldInfo.lastHost}
                </p>
                <p>Диапазон сети: {cidrFieldInfo.hostCount}</p>
              {:else}
                {@const error = cidrFieldInfo.error}
                <p class="text-sm font-medium text-destructive">
                  Ближайшие цифры {error.suggestion.lower} и {error.suggestion.upper}
                </p>
              {/if}
            {/if}
          </div>

          <Form.Field {form} name="description">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label>Description</Form.Label>
                <Input {...props} bind:value={$formData.description} />
              {/snippet}
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>

          <Separator />

          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium">Network ID</span>
            <span
              class="rounded bg-muted p-2 text-xs font-mono text-muted-foreground"
            >
              {networkId}
            </span>
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <Button type="submit" disabled={!valid()}>Save Changes</Button>
          </div>
        </form>
      </Card.Content>
    </Card.Root>

    <div class="mt-8">
      <Card.Root class="border-destructive/20 bg-destructive/5">
        <Card.Header>
          <Card.Title class="text-destructive">Danger Zone</Card.Title>
          <Card.Description>
            Permanently delete this network and all associated data.
          </Card.Description>
        </Card.Header>
        <Card.Footer>
          <Button variant="destructive" onclick={handleDelete}>
            Delete Network
          </Button>
        </Card.Footer>
      </Card.Root>
    </div>
  </div>
{/if}
