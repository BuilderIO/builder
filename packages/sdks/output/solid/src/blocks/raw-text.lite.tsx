function RawText(props) {
  return (
    <span
      class={props.attributes?.class || props.attributes?.className}
      innerHTML={props.text || ""}
    ></span>
  );
}

export default RawText;
