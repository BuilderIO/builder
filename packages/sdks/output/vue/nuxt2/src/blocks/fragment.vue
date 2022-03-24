<template>
  <span><slot></slot></span>
</template>
<script>
import { registerComponent } from '../functions/register-component';

export default registerComponent(
  {
    name: 'builder-fragment-component',

    props: [],
  },
  {
    name: 'Fragment',
    static: true,
    hidden: true,
    builtIn: true,
    canHaveChildren: true,
    noWrap: true,
  }
);
</script>
