import { useMetadata, useTarget } from '@builder.io/mitosis';
import { filterAttrs } from '../helpers.js';
import type { SectionProps } from './section.types.js';
/**
 * This import is used by the Svelte SDK. Do not remove.
 */
import { setAttrs } from '../helpers.js';

useMetadata({
  rsc: {
    componentType: 'client',
  },
});

export default function SectionComponent(props: SectionProps) {
  return (
    <section
      {...useTarget({
        vue: filterAttrs(props.attributes, 'v-on:', false),
        svelte: filterAttrs(props.attributes, 'on:', false),
        default: {},
      })}
      {...useTarget({
        vue: filterAttrs(props.attributes, 'v-on:', true),
        svelte: filterAttrs(props.attributes, 'on:', true),
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
