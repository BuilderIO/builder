/**
 * Placeholder component to be overridden by specific SDKs.
 * Allows to dynamically import components.
 */

import { onMount, useTarget } from '@builder.io/mitosis';

type AwaiterProps = {
  load: () => Promise<any>;
  props?: any;
  attributes?: any;
  fallback?: any;
  children?: any;
};

export default function Awaiter(props: AwaiterProps) {
  onMount(() => {
    useTarget({
      angular: () => {
        /** this is a hack to include the input in angular */
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
