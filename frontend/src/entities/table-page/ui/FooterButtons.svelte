<script lang="ts">
import * as Form from "$shared/ui/form/index.js";

let {
  valid,
  dialogState = $bindable(),
  isEditing,
}: {
  valid: () => boolean;
  dialogState: boolean;
  isEditing: boolean;
} = $props();
</script>

<div class="flex justify-end gap-2 mt-2 font-semibold">
  <button
    type="button"
    class="px-2.5 py-1.25 border rounded-[8px] hover:bg-accent"
    onclick={() => (dialogState = false)}
  >
    Закрыть
  </button>
  <Form.Button
    disabled={!valid()}
    class="rounded-[8px] text-secondary-foreground"
  >
    <span>{isEditing ? "Сохранить" : "Создать"}</span>
  </Form.Button>
</div>
