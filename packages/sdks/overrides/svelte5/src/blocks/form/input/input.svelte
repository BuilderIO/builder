<script lang="ts">
  import { isEditing } from '../../../functions/is-editing.js';

  interface FormInputProps {
    type?: string;
    attributes?: any;
    name?: string;
    value?: string;
    placeholder?: string;
    defaultValue?: string;
    required?: boolean;
  }

  let { type, attributes, name, value, placeholder, defaultValue, required }: FormInputProps =
    $props();

  // `value` only when set: a `value` key (even undefined) makes SSR skip `defaultValue`.
  const attrs = $derived({
    ...attributes,
    placeholder,
    type,
    name,
    ...(value !== undefined && { value }),
    defaultValue,
    required,
  });
</script>

<!-- Re-created when the default value changes in the editor, so the new default shows. -->
{#key isEditing() && defaultValue ? defaultValue : 'default-key'}
  <input {...attrs} />
{/key}
