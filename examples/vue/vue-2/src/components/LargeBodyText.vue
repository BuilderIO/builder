<script lang="ts">
import { defineComponent } from 'vue';

const LargeBodyText = defineComponent({
  name: 'LargeBodyText',
  props: {
    underline: { required: false, type: Boolean, default: false },
  },
});

export const LargeBodyTextRegistration: any = {
  component: LargeBodyText,
  name: 'Large Body Text',
  canHaveChildren: true,
  defaultChildren: [
    {
      '@type': '@builder.io/sdk:Element',
      component: { name: 'Text', options: { text: 'Large Body text here' } },
    },
  ],
  inputs: [
    {
      name: 'underline',
      type: 'text',
      defaultValue: false,
    },
  ],
  defaultStyles: {
    marginTop: '0px',
  },
};

export default LargeBodyText;
</script>

<template>
  <p
    class="font-semibold text-base md:text-lg md:leading-6"
    :class="{ underline: underline }"
  >
   
  </p>
</template>