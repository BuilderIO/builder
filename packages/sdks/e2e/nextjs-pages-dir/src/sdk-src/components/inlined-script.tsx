import * as React from "react";

/**
 * problem:
 * - svelte bug w/ SSR inlined script
 */
interface Props {
  scriptStr: string;
  id?: string;
}

function InlinedScript(props: Props) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: props.scriptStr }}
      id={props.id}
    />
  );
}

export default InlinedScript;
