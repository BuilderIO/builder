import { useContext } from '@builder.io/mitosis';
import RenderContent from '../components/render-content.lite';
import BuilderContext from '../context/builder.context.lite';

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

  return (
    <div class="builder-symbol">
      <RenderContent
        apiKey={builderContext.apiKey}
        context={builderContext.context}
        data={props.symbol?.data}
        model={props.symbol?.model}
        content={props.symbol?.content}
      />
    </div>
  );
}
