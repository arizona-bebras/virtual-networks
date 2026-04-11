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

export function useForm<TSchema extends ZodObject>(
  schema: TSchema,
  tanstackQuery?: CreateMutationResult<any, Error, z.infer<TSchema>, unknown>,
  option?: FormOptions<z.infer<TSchema>>,
): SuperForm<z.infer<TSchema>> & {
  forms: SuperForm<z.infer<TSchema>>;
  formData: SuperFormData<z.infer<TSchema>>;
  valid: () => boolean;
} {
  const valid = $state({
    value: false,
  });

  const initialData = defaults(zod4(schema)) as SuperValidated<
    z.infer<TSchema>
  >;
  const form = superForm(initialData, {
    SPA: true,
    onUpdate: async ({ form }) => {
      const request = await tanstackQuery?.mutateAsync(form.data);
      if (request) {
        const { token } = request as any;
        localStorage.setItem("token", token);
        goto("/app");
      }
    },
    onChange: async () => {
      const form = await validateForm();
      valid.value = form.valid;
      console.log("форма изменилась, состояние валидации: ", valid);
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
