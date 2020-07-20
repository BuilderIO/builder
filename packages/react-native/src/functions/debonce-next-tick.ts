import { Builder } from '@builder.io/sdk';

const nextTick = Builder.nextTick;

// Plain function - e.g. const debounced = debounceNextTick(fn);
export function debounceNextTick(fn: (...args: any[]) => void): () => void;
// Decorator - e.g. class Foo { @debounceNextTick myMethod() { ... } }
export function debounceNextTick(
  target: any,
  key: PropertyKey,
  descriptor: PropertyDescriptor
): PropertyDescriptor;
export function debounceNextTick(
  target: object | ((...args: any[]) => void),
  key?: PropertyKey,
  descriptor?: PropertyDescriptor
) {
  if (typeof key === 'undefined' && typeof target === 'function') {
    return debounceNextTickImpl(target as any);
  }
  return {
    configurable: true,
    enumerable: descriptor!.enumerable,
    get: function getter(): any {
      // Attach this function to the instance (not the class)
      Object.defineProperty(this, key!, {
        configurable: true,
        enumerable: descriptor!.enumerable,
        value: debounceNextTickImpl(descriptor!.value),
      });

      return (this as any)[key!];
    },
  } as PropertyDescriptor;
}

function debounceNextTickImpl(fn: (...args: any[]) => void) {
  let args: any[] | null = null;
  let context: any = null;

  return debounced;

  function debounced(this: any) {
    const previous = args;
    args = [].slice.call(arguments);
    context = this;
    if (previous !== null) return;
    nextTick(next);
  }

  function next() {
    fn.apply(context, args as any);
    args = null;
    context = null;
  }
}
