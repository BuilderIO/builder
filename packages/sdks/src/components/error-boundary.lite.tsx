export default function ErrorBoundary(props: any) {
  // Noop component to allow implementing per framework
  // TODO: get <>{props.children}</> to work
  return props.children;
}
