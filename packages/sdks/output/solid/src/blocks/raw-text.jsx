function RawText(props) {
  return <span class={props.attributes?.class || props.attributes?.className} innerHTML={props.text || ""}></span>;
}

export default RawText;import { registerComponent } from '../functions/register-component';
registerComponent(RawText, {name:'Builder:RawText',hideFromInsertMenu:true,builtIn:true,inputs:[{name:'text',bubble:true,type:'longText',required:true}]});