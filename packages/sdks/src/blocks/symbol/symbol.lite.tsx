import RenderContent from '../../components/render-content/render-content.lite';
import BuilderContext from '../../context/builder.context.lite';
import { getContent } from '../../functions/get-content/index.js';
import type { BuilderContent } from '../../types/builder-content.js';
import { onMount, onUpdate, useContext, useStore } from '@builder.io/mitosis';
import type { BuilderBlock } from '../../types/builder-block.js';
import { TARGET } from '../../constants/target';
import { logger } from '../../helpers/logger';

export interface SymbolInfo {
  model?: string;
  entry?: string;
  data?: any;
  content?: BuilderContent;
  inline?: boolean;
  dynamic?: boolean;
}

export interface SymbolProps {
  symbol?: SymbolInfo;
  dataOnly?: boolean;
  dynamic?: boolean;
  builderBlock?: BuilderBlock;
  attributes?: any;
  inheritState?: boolean;
}

export default function Symbol(props: SymbolProps) {
  const builderContext = useContext(BuilderContext);

  const state = useStore({
    className: [
      ...(TARGET === 'vue2' || TARGET === 'vue3'
        ? Object.keys(props.attributes.class)
        : [props.attributes.class]),
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
        builderContext?.apiKey
      ) {
        getContent({
          model: props.symbol.model,
          apiKey: builderContext.apiKey,
          apiVersion: builderContext.apiVersion,
          query: {
            id: props.symbol.entry,
          },
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
      {...props.attributes}
      className={state.className}
      dataSet={{ class: state.className }}
    >
      <RenderContent
        apiVersion={builderContext.apiVersion}
        apiKey={builderContext.apiKey!}
        context={builderContext.context}
        customComponents={Object.values(builderContext.registeredComponents)}
        data={{
          ...props.symbol?.data,
          ...builderContext.localState,
          ...state.contentToUse?.data?.state,
        }}
        model={props.symbol?.model}
        content={state.contentToUse}
      />
    </div>
  );
}
