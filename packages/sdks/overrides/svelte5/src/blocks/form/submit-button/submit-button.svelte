<script lang="ts">
  interface ButtonProps {
    attributes?: any;
    text?: string;
  }

  let { attributes, text }: ButtonProps = $props();
</script>

<button {...attributes} type="submit">{text}</button>
