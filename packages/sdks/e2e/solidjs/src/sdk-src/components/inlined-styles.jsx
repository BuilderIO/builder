function InlinedStyles(props) {
  return <style innerHTML={props.styles} id={props.id}></style>;
}

export default InlinedStyles;
