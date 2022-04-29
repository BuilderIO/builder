function Button(props) {
  return <a {...props.attributes} role="button" href={props.link} target={props.openLinkInNewTab ? "_blank" : undefined}>
      {props.text}
    </a>;
}

export default Button;import { registerComponent } from '../functions/register-component';
registerComponent(Button, {name:'Core:Button',builtIn:true,image:'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2F81a15681c3e74df09677dfc57a615b13',defaultStyles:{appearance:'none',paddingTop:'15px',paddingBottom:'15px',paddingLeft:'25px',paddingRight:'25px',backgroundColor:'#000000',color:'white',borderRadius:'4px',textAlign:'center',cursor:'pointer'},inputs:[{name:'text',type:'text',defaultValue:'Click me!',bubble:true},{name:'link',type:'url',bubble:true},{name:'openLinkInNewTab',type:'boolean',defaultValue:false,friendlyName:'Open link in new tab'}],static:true,noWrap:true});