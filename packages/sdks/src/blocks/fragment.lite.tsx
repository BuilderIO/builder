import '@builder.io/mitosis';
import RenderBlocks from '../components/render-blocks.lite';
import { registerComponent } from '../functions/register-component';

export interface FragmentProps {
  maxWidth?: number;
  attributes?: any;
  children?: any;
}

export default function FragmentComponent(props: FragmentProps) {
  return <RenderBlocks path="children" blocks={props.children} />;
}

registerComponent({
  name: 'Fragment',
  static: true,
  hidden: true,
  canHaveChildren: true,
  noWrap: true,
});
