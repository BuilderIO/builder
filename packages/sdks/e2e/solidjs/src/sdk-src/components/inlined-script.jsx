function InlinedScript(props) {
  return <script innerHTML={props.scriptStr} id={props.id}></script>;
}

export default InlinedScript;
