<script lang="ts">
  import Button, { Label } from '@smui/button';
  export let variant: 'raised' | 'text' | 'unelevated' | 'outlined'
  export let label = 'label'
  export let onClick = () => {}
  export let link = ''
  
</script>

<Button href={link} variant={variant} onClick={onClick}>
  <Label>{label}</Label>
</Button>