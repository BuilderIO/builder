import { createMutable } from "solid-js/store";
import RenderContent from "../components/render-content/render-content";
import BuilderContext from "../context/builder.context";

function Symbol(props) {
  const state = createMutable({
    className: "builder-symbol",
    content: null
  });
  const builderContext = useContext(BuilderContext);
  onMount(() => {
    state.content = props.symbol?.content;
  });
  return <div class={state.className} {...props.attributes} dataSet={{
    class: state.className
  }}>
      <RenderContent apiKey={builderContext.apiKey} context={builderContext.context} data={{ ...props.symbol?.data,
      ...builderContext.state,
      ...props.symbol?.state.content?.data?.state
    }} model={props.symbol?.model} content={state.content}></RenderContent>
    </div>;
}

export default Symbol;import { registerComponent } from '../functions/register-component';
registerComponent(Symbol, {name:'Symbol',noWrap:true,static:true,inputs:[{name:'symbol',type:'uiSymbol'},{name:'dataOnly',helperText:"Make this a data symbol that doesn't display any UI",type:'boolean',defaultValue:false,advanced:true,hideFromUI:true},{name:'inheritState',helperText:'Inherit the parent component state and data',type:'boolean',defaultValue:false,advanced:true},{name:'renderToLiquid',helperText:'Render this symbols contents to liquid. Turn off to fetch with javascript and use custom targeting',type:'boolean',defaultValue:false,advanced:true,hideFromUI:true},{name:'useChildren',hideFromUI:true,type:'boolean'}]});