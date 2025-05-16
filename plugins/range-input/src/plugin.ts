/** @jsx jsx */
import { jsx } from '@emotion/core'; // Required for Emotion to work
import { Builder } from '@builder.io/react';
import { RangeInputEditor } from './rangeInput';

Builder.registerEditor({
  name: "rangeInput",
  component: RangeInputEditor,
  icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSI+PHBhdGggc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgZD0iTTYgMTJhMiAyIDAgMSAwIDQgMCAyIDIgMCAwIDAtNCAwWk00IDEyaDJNMTAgMTJoMTAiLz48L3N2Zz4=',
});