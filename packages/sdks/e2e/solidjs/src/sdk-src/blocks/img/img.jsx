import { isEditing } from "../../functions/is-editing.js";
import { filterAttrs } from "../helpers.js";

function ImgComponent(props) {
  return (
    <img
      style={{
        "object-fit": props.backgroundSize || "cover",
        "object-position": props.backgroundPosition || "center",
      }}
      key={(isEditing() && props.imgSrc) || "default-key"}
      alt={props.altText}
      src={props.imgSrc || props.image}
      {...{}}
      {...props.attributes}
    />
  );
}

export default ImgComponent;
