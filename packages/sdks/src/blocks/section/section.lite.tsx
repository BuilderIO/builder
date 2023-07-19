import { useTarget } from '@builder.io/mitosis';
import { filterAttrs } from '../helpers';

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
          ...filterAttrs(props.attributes, 'v-on:', true),
          ...filterAttrs(props.attributes, 'v-on:', false),
        },
        vue3: {
          ...filterAttrs(props.attributes, 'v-on:', true),
          ...filterAttrs(props.attributes, 'v-on:', false),
        },
        svelte: {
          ...filterAttrs(props.attributes, 'on:', true),
          ...filterAttrs(props.attributes, 'on:', false),
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
