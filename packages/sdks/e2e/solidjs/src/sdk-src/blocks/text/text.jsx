function Text(props) {
  return (
    <div
      class="builder-text"
      innerHTML={props.text?.toString() || ""}
      style={{
        outline: "none",
      }}
    ></div>
  );
}

export default Text;
