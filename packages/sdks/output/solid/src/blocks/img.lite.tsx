import { isEditing } from "../functions/is-editing";

export default function ImgComponent(props) {
  return (
    <img
      {...props.attributes}
      style={{
        "object-fit": props.backgroundSize || "cover",
        "object-position": props.backgroundPosition || "center",
      }}
      key={(isEditing() && props.imgSrc) || "default-key"}
      alt={props.altText}
      src={props.imgSrc}
    />
  );
}
