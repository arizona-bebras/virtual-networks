import type { CreateMutationResult } from "@tanstack/svelte-query";
import {
  defaults,
  type FormOptions,
  type SuperForm,
  type SuperValidated,
  superForm,
} from "sveltekit-superforms";
import { zod4, zod4Client } from "sveltekit-superforms/adapters";
import type { SuperFormData } from "sveltekit-superforms/client";
import type { ZodObject, z } from "zod/v4";
import { goto } from "$app/navigation";

type MutationResult<TSchema extends ZodObject> = CreateMutationResult<
  Record<string, string>,
  Error,
  z.infer<TSchema>,
  unknown
>;

export function useForm<TSchema extends ZodObject>(
  schema: TSchema,
  tanstackQuery?: MutationResult<TSchema>,
  option?: FormOptions<z.infer<TSchema>>,
): SuperForm<z.infer<TSchema>> & {
  forms: SuperForm<z.infer<TSchema>>;
  formData: SuperFormData<z.infer<TSchema>>;
  valid: () => boolean;
} {
  const valid = $state({ value: false });

  const initialData = defaults(zod4(schema)) as SuperValidated<
    z.infer<TSchema>
  >;
  const form = superForm(initialData, {
    SPA: true,
    onUpdate: async ({ form }) => {
      const response = await tanstackQuery?.mutateAsync(form.data);

      if (response?.token) {
        localStorage.setItem("token", response.token);
        goto("/app/dashboard");
      }
    },
    onChange: async () => {
      const result = await validateForm();
      valid.value = result.valid;
    },
    ...option,
    validators: zod4Client(schema),
  });

  const { validateForm } = form;

  return {
    forms: form,
    formData: form.form,
    ...form,
    valid: () => valid.value,
  };
}
