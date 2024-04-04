interface Props {
  scriptStr: string;
  id: string;
  dataId: string;
}

export default function InlinedScript(props: Props) {
  return (
    <script innerHTML={props.scriptStr} id={props.id} data-id={props.dataId} />
  );
}
