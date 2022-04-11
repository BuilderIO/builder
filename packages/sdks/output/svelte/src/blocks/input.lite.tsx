<script>
  import { isEditing } from "../functions/is-editing";

  export let attributes;
  export let defaultValue;
  export let placeholder;
  export let type;
  export let name;
  export let value;
  export let required;

</script>

<input
  {...attributes}
  key={isEditing() && defaultValue ? defaultValue : 'default-key'}
  {placeholder}
  {type}
  {name}
  {value}
  {defaultValue}
  {required} />
