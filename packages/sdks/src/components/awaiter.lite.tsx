/**
 * Placeholder component to be overridden by specific SDKs.
 * Allows to dynamically import components.
 */
import { onMount, useTarget } from '@builder.io/mitosis';
import type { AwaiterProps } from './awaiter.types';

export default function Awaiter(props: AwaiterProps) {
  onMount(() => {
    useTarget({
      angular: () => {
        /** this is a hack to include unused props */
        const _ = {
          a: props.load,
          b: props.props,
          c: props.attributes,
          d: props.fallback,
        };
      },
    });
  });
  return <>{props.children}</>;
}
