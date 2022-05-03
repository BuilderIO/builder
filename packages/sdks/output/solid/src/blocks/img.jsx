import { isEditing } from "../functions/is-editing";

function ImgComponent(props) {
  return <img {...props.attributes} style={{
    "object-fit": props.backgroundSize || "cover",
    "object-position": props.backgroundPosition || "center"
  }} key={isEditing() && props.imgSrc || "default-key"} alt={props.altText} src={props.imgSrc} />;
}

export default ImgComponent;import { registerComponent } from '../functions/register-component';
registerComponent(ImgComponent, {name:'Raw:Img',hideFromInsertMenu:true,builtIn:true,image:'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-insert_photo-24px.svg?alt=media&token=4e5d0ef4-f5e8-4e57-b3a9-38d63a9b9dc4',inputs:[{name:'image',bubble:true,type:'file',allowedFileTypes:['jpeg','jpg','png','svg'],required:true}],noWrap:true,static:true});