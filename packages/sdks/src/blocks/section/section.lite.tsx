import { useTarget } from '@builder.io/mitosis';
import { filterVueAttrs } from '../helpers';

export interface SectionProps {
  maxWidth?: number;
  attributes?: any;
  children?: any;
  builderBlock?: any;
}

export default function SectionComponent(props: SectionProps) {
  return (
    <section
      {...useTarget({
        vue2: {
          ...filterVueAttrs(props.attributes, true),
          ...filterVueAttrs(props.attributes, false),
        },
        vue3: {
          ...filterVueAttrs(props.attributes, true),
          ...filterVueAttrs(props.attributes, false),
        },
        default: props.attributes,
      })}
      style={{
        width: '100%',
        alignSelf: 'stretch',
        flexGrow: 1,
        boxSizing: 'border-box',
        maxWidth: props.maxWidth || 1200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      {props.children}
    </section>
  );
}
