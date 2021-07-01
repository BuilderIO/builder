type ComponentProps = any;

export function Component(props: ComponentProps) {
  const Is = props.is;
  return <>{Is && <Is {...props} />}</>;
}
