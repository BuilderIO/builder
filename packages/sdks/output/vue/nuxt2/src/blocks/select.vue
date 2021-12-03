<template>
  <select
    v-bind="attributes"
    :value="value"
    :key="isEditing() && defaultValue ? defaultValue : 'default-key'"
    :defaultValue="defaultValue"
    :name="name"
  >
    <option
      v-for="(option, index) in options"
      :value="option.value"
      :key="index"
    >
      {{ option.name || option.value }}
    </option>
  </select>
</template>
<script>
import { isEditing } from '../functions/is-editing';

import { registerComponent } from '@builder.io/sdk-vue';

export default registerComponent(
  {
    name: 'builder-select-component',

    props: ['attributes', 'value', 'defaultValue', 'name', 'options'],

    data: () => ({ isEditing }),
  },
  {
    name: 'Form:Select',
    builtIn: true,
    image:
      'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2F83acca093fb24aaf94dee136e9a4b045',
    defaultStyles: { alignSelf: 'flex-start' },
    inputs: [
      {
        name: 'options',
        type: 'list',
        required: true,
        subFields: [
          { name: 'value', type: 'text', required: true },
          { name: 'name', type: 'text' },
        ],
        defaultValue: [{ value: 'option 1' }, { value: 'option 2' }],
      },
      {
        name: 'name',
        type: 'string',
        required: true,
        helperText:
          'Every select in a form needs a unique name describing what it gets, e.g. "email"',
      },
      { name: 'defaultValue', type: 'string' },
      { name: 'value', type: 'string', advanced: true },
      { name: 'required', type: 'boolean', defaultValue: false },
    ],
    static: true,
    noWrap: true,
  }
);
</script>
