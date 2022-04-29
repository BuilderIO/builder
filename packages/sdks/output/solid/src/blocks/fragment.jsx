function FragmentComponent(props) {
  return <span>{props.children}</span>;
}

export default FragmentComponent;import { registerComponent } from '../functions/register-component';
registerComponent(FragmentComponent, {name:'Fragment',static:true,hidden:true,builtIn:true,canHaveChildren:true,noWrap:true});