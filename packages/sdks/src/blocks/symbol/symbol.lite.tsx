import ContentVariants from '../../components/content-variants/content-variants.lite';
import BuilderContext from '../../context/builder.context.lite';
import { getContent } from '../../functions/get-content/index.js';
import type { BuilderContent } from '../../types/builder-content.js';
import {
  onMount,
  onUpdate,
  useContext,
  useStore,
  useTarget,
} from '@builder.io/mitosis';
import { logger } from '../../helpers/logger';
import type {
  BuilderComponentsProp,
  PropsWithBuilderData,
} from '../../types/builder-props';
import { filterAttrs } from '../helpers';
/**
 * This import is used by the Svelte SDK. Do not remove.
 */
// eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
import { setAttrs } from '../helpers';

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
  const builderContext = useContext(BuilderContext);

  const state = useStore({
    className: [
      ...useTarget({
        vue2: Object.keys(props.attributes.class),
        vue3: Object.keys(props.attributes.class),
        react: [props.attributes.className],
        default: [props.attributes.class],
      }),
      'builder-symbol',
      props.symbol?.inline ? 'builder-inline-symbol' : undefined,
      props.symbol?.dynamic || props.dynamic
        ? 'builder-dynamic-symbol'
        : undefined,
    ]
      .filter(Boolean)
      .join(' '),
    contentToUse: props.symbol?.content,
    fetchContent: async () => {
      /**
       * If:
       * - we have a symbol prop
       * - yet it does not have any content
       * - and we have not already stored content from before
       * - and it has a model name
       *
       * then we want to re-fetch the symbol content.
       */
      if (
        !state.contentToUse &&
        props.symbol?.model &&
        // This is a hack, we should not need to check for this, but it is needed for Svelte.
        builderContext.value?.apiKey
      ) {
        getContent({
          model: props.symbol.model,
          apiKey: builderContext.value.apiKey,
          apiVersion: builderContext.value.apiVersion,
          ...(props.symbol?.entry && {
            query: {
              id: props.symbol.entry,
            },
          }),
        })
          .then((response) => {
            if (response) {
              state.contentToUse = response;
            }
          })
          .catch((err) => {
            logger.error('Could not fetch symbol content: ', err);
          });
      }
    },
  });

  onUpdate(() => {
    state.fetchContent();
  }, [props.symbol]);

  onMount(() => {
    state.fetchContent();
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
      dataSet={{ class: state.className }}
    >
      <ContentVariants
        __isNestedRender
        apiVersion={builderContext.value.apiVersion}
        apiKey={builderContext.value.apiKey!}
        context={builderContext.value.context}
        customComponents={Object.values(props.builderComponents)}
        data={{
          ...props.symbol?.data,
          ...builderContext.value.localState,
          ...state.contentToUse?.data?.state,
        }}
        model={props.symbol?.model}
        content={state.contentToUse}
      />
    </div>
  );
}
