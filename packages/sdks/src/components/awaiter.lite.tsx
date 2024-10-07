/**
 * Placeholder component to be overridden by specific SDKs.
 * Allows to dynamically import components.
 */

type AwaiterProps = {
  load: () => Promise<any>;
  props?: any;
  attributes?: any;
  fallback?: any;
  children?: any;
};

export default function Awaiter(props: AwaiterProps) {
  return <>{props.children}</>;
}
