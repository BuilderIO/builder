import { Fragment, component$, h } from "@builder.io/qwik";

interface Props {
  scriptStr: string;
  id?: string;
}
export const InlinedScript = component$((props: Props) => {
  return (
    <script dangerouslySetInnerHTML={props.scriptStr} id={props.id}></script>
  );
});

export default InlinedScript;
