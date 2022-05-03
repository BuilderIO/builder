import { For } from "solid-js";
import { isEditing } from "../functions/is-editing";

function SelectComponent(props) {
  return <select {...props.attributes} value={props.value} key={isEditing() && props.defaultValue ? props.defaultValue : "default-key"} defaultValue={props.defaultValue} name={props.name}>
      <For each={props.options}>
        {(option, _index) => {
        const index = _index();

        return <option value={option.value}>{option.name || option.value}</option>;
      }}
      </For>
    </select>;
}

export default SelectComponent;import { registerComponent } from '../functions/register-component';
registerComponent(SelectComponent, {name:'Form:Select',builtIn:true,image:'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2F83acca093fb24aaf94dee136e9a4b045',defaultStyles:{alignSelf:'flex-start'},inputs:[{name:'options',type:'list',required:true,subFields:[{name:'value',type:'text',required:true},{name:'name',type:'text'}],defaultValue:[{value:'option 1'},{value:'option 2'}]},{name:'name',type:'string',required:true,helperText:'Every select in a form needs a unique name describing what it gets, e.g. "email"'},{name:'defaultValue',type:'string'},{name:'value',type:'string',advanced:true},{name:'required',type:'boolean',defaultValue:false}],static:true,noWrap:true});