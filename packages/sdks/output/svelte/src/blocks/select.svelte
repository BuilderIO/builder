<script>
  import { isEditing } from "../functions/is-editing";

  export let attributes;
  export let value;
  export let defaultValue;
  export let name;
  export let options;

</script>

<select
  {...attributes}
  {value}
  key={isEditing() && defaultValue ? defaultValue : 'default-key'}
  {defaultValue}
  {name}>
  {#each options as option}
    <option value={option.value}>{option.name || option.value}</option>
  {/each}
</select>
