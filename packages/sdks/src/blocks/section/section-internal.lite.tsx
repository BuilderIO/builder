import RenderBlocks from '../../components/render-blocks.lite';
import { componentInfo } from './component-info';
import '@builder.io/mitosis';
import { useMetadata } from '@builder.io/mitosis';

export interface SectionProps {
  maxWidth?: number;
  attributes?: any;
  children?: any;
  builderBlock?: any;
}

export default function SectionComponent(props: SectionProps) {
  return (
    <section
      {...props.attributes}
      style={
        props.maxWidth && typeof props.maxWidth === 'number'
          ? { maxWidth: props.maxWidth }
          : undefined
      }
    >
      {props.children}
    </section>
  );
}
