export default function Button(props) {
  return (
    <a
      {...props.attributes}
      role="button"
      href={props.link}
      target={props.openLinkInNewTab ? "_blank" : undefined}
    >
      {props.text}
    </a>
  );
}
