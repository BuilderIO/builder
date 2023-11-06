import { filterAttrs } from "../helpers.js";

function SectionComponent(props) {
  return (
    <section
      {...{}}
      {...props.attributes}
      style={{
        width: "100%",
        "align-self": "stretch",
        "flex-grow": 1,
        "box-sizing": "border-box",
        "max-width": props.maxWidth || 1200,
        display: "flex",
        "flex-direction": "column",
        "align-items": "stretch",
        "margin-left": "auto",
        "margin-right": "auto",
      }}
    >
      {props.children}
    </section>
  );
}

export default SectionComponent;
