import { onMount, onUpdate, useContext, useState } from '@builder.io/mitosis';
import RenderContent from '../components/render-content/render-content.lite';
import BuilderContext from '../context/builder.context';
import { getContent } from '../functions/get-content';
import { registerComponent } from '../functions/register-component';
import { BuilderContent } from '../types/builder-content';

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

  const state = useState({
    className: 'builder-symbol',
    content: null as BuilderContent | null,
  });

  onMount(() => {
    state.content = props.symbol?.content;
  });

  onUpdate(() => {
    const symbol = props.symbol;

    if (symbol && !symbol.content && !state.content && symbol.model) {
      getContent({
        model: symbol.model,
        apiKey: builderContext.apiKey!,
        options: {
          entry: symbol.entry,
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
        content={state.content!}
      />
    </div>
  );
}

registerComponent({
  name: 'Symbol',
  noWrap: true,
  static: true,
  inputs: [
    {
      name: 'symbol',
      type: 'uiSymbol',
    },
    {
      name: 'dataOnly',
      helperText: "Make this a data symbol that doesn't display any UI",
      type: 'boolean',
      defaultValue: false,
      advanced: true,
      hideFromUI: true,
    },
    {
      name: 'inheritState',
      helperText: 'Inherit the parent component state and data',
      type: 'boolean',
      defaultValue: false,
      advanced: true,
    },
    {
      name: 'renderToLiquid',
      helperText:
        'Render this symbols contents to liquid. Turn off to fetch with javascript and use custom targeting',
      type: 'boolean',
      defaultValue: false,
      advanced: true,
      hideFromUI: true,
    },
    {
      name: 'useChildren',
      hideFromUI: true,
      type: 'boolean',
    },
  ],
});
