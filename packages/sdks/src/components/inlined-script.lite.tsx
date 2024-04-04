interface Props {
  scriptStr: string;
  id: string;
}

export default function InlinedScript(props: Props) {
  return <script innerHTML={props.scriptStr} data-id={props.id} />;
}
