import { Show, useMetadata } from '@builder.io/mitosis';
import { isEmptyElement } from './dynamic-renderer.helpers.js';

/**
 * These imports are used by the Svelte SDK. Do not remove.
 */
import { setAttrs } from '../../blocks/helpers.js';
import type { PropsWithChildren } from '../../types/typescript.js';

useMetadata({
  options: {
    vue3: {
      asyncComponentImports: true,
    },
  },
  rsc: {
    componentType: 'client',
  },
});

/**
 * Dynamic renderer. Takes care of:
 * - Svelte: picking between `svelte:component` and `svelte:element`
 * - Svelte and NextJS: not passing children to closed HTML tags.
 */
export default function DynamicRenderer(
  props: PropsWithChildren<{
    TagName: any;
    attributes: any;
    actionAttributes: any;
    style: any;
  }>
) {
  return (
    <Show
      when={!isEmptyElement(props.TagName)}
      else={
        <props.TagName
          {...props.attributes}
          {...props.actionAttributes}
          style={props.style}
          MAGIC={'element'}
        />
      }
    >
      <Show
        when={typeof props.TagName === 'string'}
        else={
          <props.TagName
            {...props.attributes}
            {...props.actionAttributes}
            style={props.style}
            MAGIC={'component'}
          >
            {props.children}
          </props.TagName>
        }
      >
        <props.TagName
          {...props.attributes}
          {...props.actionAttributes}
          style={props.style}
          MAGIC={'element'}
        >
          {props.children}
        </props.TagName>
      </Show>
    </Show>
  );
}
