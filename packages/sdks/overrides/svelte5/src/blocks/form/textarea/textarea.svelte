<script lang="ts">
  interface TextareaProps {
    attributes?: any;
    name?: string;
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    required?: boolean;
  }

  let { attributes, name, value, defaultValue, placeholder, required }: TextareaProps = $props();
</script>

<textarea {...attributes} {placeholder} {name} {value} {defaultValue} {required}></textarea>
