export default function ComponentNeedsHello({
  builderComponents,
}: {
  builderComponents: any;
}) {
  const HelloComponent = builderComponents.Hello;

  return <div id="component-needs-hello">{typeof HelloComponent}</div>;
}
