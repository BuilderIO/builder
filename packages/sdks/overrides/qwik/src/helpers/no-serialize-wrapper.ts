import { noSerialize } from '@builder.io/qwik';

export function noSerializeWrapper(fn: () => void) {
  return noSerialize(fn);
}
