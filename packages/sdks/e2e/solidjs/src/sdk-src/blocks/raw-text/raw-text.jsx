function RawText(props) {
  return (
    <div
      class={props.attributes.class}
      innerHTML={props.text?.toString() || ""}
    ></div>
  );
}

export default RawText;
