import * as React from "react";

interface Props {
  scriptStr: string;
  id: string;
}

function InlinedScript(props: Props) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: props.scriptStr }}
      data-id={props.id}
    />
  );
}

export default InlinedScript;
