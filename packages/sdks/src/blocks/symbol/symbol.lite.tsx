import {
  onMount,
  onUpdate,
  useMetadata,
  useStore,
  useTarget,
} from '@builder.io/mitosis';
import ContentVariants from '../../components/content-variants/content-variants.lite.jsx';
import type { BuilderContent } from '../../types/builder-content.js';
import { filterAttrs } from '../helpers.js';
/**
 * This import is used by the Svelte SDK. Do not remove.
 */

import { getClassPropName } from '../../functions/get-class-prop-name.js';
import type { Nullable } from '../../types/typescript.js';
import { setAttrs } from '../helpers.js';
import { fetchSymbolContent } from './symbol.helpers.js';
import type { SymbolProps } from './symbol.types.js';

useMetadata({
  rsc: {
    componentType: 'server',
  },
});

export default function Symbol(props: SymbolProps) {
  const state = useStore({
    get className() {
      return [
        ...useTarget({
          reactNative: [],
          default: [props.attributes[getClassPropName()]],
        }),
        'builder-symbol',
        props.symbol?.inline ? 'builder-inline-symbol' : undefined,
        props.symbol?.dynamic || props.dynamic
          ? 'builder-dynamic-symbol'
          : undefined,
      ]
        .filter(Boolean)
        .join(' ');
    },

    contentToUse: useTarget<Nullable<BuilderContent>>({
      default: props.symbol?.content,
      rsc: (async () =>
        props.symbol?.content ||
        (await fetchSymbolContent({
          symbol: props.symbol,
          builderContextValue: props.builderContext.value,
        }))) as Nullable<BuilderContent>,
    }),
    setContent() {
      if (state.contentToUse) return;

      fetchSymbolContent({
        symbol: props.symbol,
        builderContextValue: props.builderContext.value,
      }).then((newContent) => {
        if (newContent) {
          state.contentToUse = newContent;
        }
      });
    },
  });

  onUpdate(() => {
    state.setContent();
  }, [props.symbol]);

  onMount(() => {
    useTarget({
      react: () => {},
      reactNative: () => {},

      default: () => {
        state.setContent();
      },
    });
  });

  return (
    <div
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
      className={state.className}
      {...useTarget({
        reactNative: { dataSet: { class: state.className } },
        default: {},
      })}
    >
      <ContentVariants
        __isNestedRender
        apiVersion={props.builderContext.value.apiVersion}
        apiKey={props.builderContext.value.apiKey!}
        context={{
          ...props.builderContext.value.context,
          symbolId: props.builderBlock?.id,
        }}
        customComponents={Object.values(props.builderComponents)}
        data={{
          ...props.symbol?.data,
          ...props.builderContext.value.localState,
          ...state.contentToUse?.data?.state,
        }}
        model={props.symbol?.model}
        content={state.contentToUse}
        linkComponent={props.builderLinkComponent}
      />
    </div>
  );
}
