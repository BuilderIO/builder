import RenderContent from '../../components/render-content/render-content.lite';
import BuilderContext from '../../context/builder.context.lite';
import { getContent } from '../../functions/get-content/index.js';
import { BuilderContent } from '../../types/builder-content.js';
import { onMount, onUpdate, useContext, useStore } from '@builder.io/mitosis';

export interface SymbolInfo {
  model?: string;
  entry?: string;
  data?: any;
  content?: any;
  inline?: boolean;
  dynamic?: boolean;
}

export interface SymbolProps {
  symbol?: SymbolInfo;
  dataOnly?: boolean;
  dynamic?: boolean;
  builderBlock?: any; // TODO: BuilderElement
  attributes?: any;
  inheritState?: boolean;
}

export default function Symbol(props: SymbolProps) {
  const builderContext = useContext(BuilderContext);

  const state = useStore({
    className: 'builder-symbol',
    content: null as BuilderContent | null,
  });

  onMount(() => {
    state.content = props.symbol?.content;
  });

  onUpdate(() => {
    const symbolToUse = props.symbol;

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
      symbolToUse &&
      !symbolToUse.content &&
      !state.content &&
      symbolToUse.model
    ) {
      getContent({
        model: symbolToUse.model,
        apiKey: builderContext.apiKey!,
        query: {
          id: symbolToUse.entry,
        },
      }).then((response) => {
        state.content = response;
      });
    }
  }, [
    props.symbol?.content,
    props.symbol?.model,
    props.symbol?.entry,
    state.content,
  ]);

  return (
    <div
      {...props.attributes}
      className={state.className}
      dataSet={{ class: state.className }}
    >
      <RenderContent
        apiKey={builderContext.apiKey!}
        context={builderContext.context}
        data={{
          ...props.symbol?.data,
          ...builderContext.state,
          ...props.symbol?.content?.data?.state,
        }}
        model={props.symbol?.model}
        content={state.content}
      />
    </div>
  );
}
