import ContentVariants from '../../components/content-variants/content-variants.lite.jsx';
import type { BuilderContent } from '../../types/builder-content.js';
import {
  onMount,
  onUpdate,
  useMetadata,
  useStore,
  useTarget,
} from '@builder.io/mitosis';
import type {
  BuilderComponentsProp,
  PropsWithBuilderData,
} from '../../types/builder-props.js';
import { filterAttrs } from '../helpers.js';
/**
 * This import is used by the Svelte SDK. Do not remove.
 */
// eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
import { setAttrs } from '../helpers.js';
import { fetchSymbolContent } from './symbol.helpers.js';
import type { Nullable } from '../../types/typescript.js';

useMetadata({
  rsc: {
    componentType: 'server',
  },
});

export interface SymbolInfo {
  model?: string;
  entry?: string;
  data?: any;
  content?: BuilderContent;
  inline?: boolean;
  dynamic?: boolean;
}

export interface SymbolProps extends BuilderComponentsProp {
  symbol?: SymbolInfo;
  dataOnly?: boolean;
  dynamic?: boolean;
  attributes?: any;
  inheritState?: boolean;
}

export default function Symbol(props: PropsWithBuilderData<SymbolProps>) {
  const state = useStore({
    get className() {
      return [
        ...useTarget({
          vue2: Object.keys(props.attributes.class),
          vue3: Object.keys(props.attributes.class),
          react: [props.attributes.className],
          rsc: [props.attributes.className],
          reactNative: [],
          default: [props.attributes.class],
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
    state.setContent();
  });

  return (
    <div
      {...useTarget({
        vue2: filterAttrs(props.attributes, 'v-on:', false),
        vue3: filterAttrs(props.attributes, 'v-on:', false),
        svelte: filterAttrs(props.attributes, 'on:', false),
        default: {},
      })}
      {...useTarget({
        vue2: filterAttrs(props.attributes, 'v-on:', true),
        vue3: filterAttrs(props.attributes, 'v-on:', true),
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
        context={props.builderContext.value.context}
        customComponents={Object.values(props.builderComponents)}
        data={{
          ...props.symbol?.data,
          ...props.builderContext.value.localState,
          ...state.contentToUse?.data?.state,
        }}
        model={props.symbol?.model}
        content={state.contentToUse}
      />
    </div>
  );
}
