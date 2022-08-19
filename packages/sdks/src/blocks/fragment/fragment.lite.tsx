export interface FragmentProps {
  maxWidth?: number;
  attributes?: any;
  children?: any;
}

export default function FragmentComponent(props: FragmentProps) {
  // TODO: flag for if target supports fragments / doesn't need root/host elements
  // and use a normal fragment, otherwise use span
  return <span>{props.children}</span>;
}
