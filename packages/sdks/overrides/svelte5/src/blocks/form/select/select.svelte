<script lang="ts">
  import { isEditing } from '../../../functions/is-editing.js';

  interface FormSelectProps {
    options?: { name?: string; value: string }[];
    attributes?: any;
    name?: string;
    value?: string;
    defaultValue?: string;
    required?: boolean;
  }

  let { options, attributes, name, value, defaultValue, required }: FormSelectProps = $props();
</script>

<!-- Re-created when the default value changes in the editor, so the new default shows. -->
{#key isEditing() && defaultValue ? defaultValue : 'default-key'}
  <select {...attributes} {value} {defaultValue} {name} {required}>
    {#each options as option, index (`${option.name}-${index}`)}
      <option value={option.value}>{option.name || option.value}</option>
    {/each}
  </select>
{/key}
