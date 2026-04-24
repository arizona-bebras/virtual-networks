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

export function useForm<TSchema extends ZodObject>(
  schema: TSchema,
  option?: FormOptions<z.infer<TSchema>>,
  // onResponse?: (response: Result) => void,
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
    onSubmit: async () => {
      // const data = schema.parse(Object.fromEntries(formData));
      // const response = await tanstackQuery?.mutateAsync(data);
      // if (response) onResponse?.(response);
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
