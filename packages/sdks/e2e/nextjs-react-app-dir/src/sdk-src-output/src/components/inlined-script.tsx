'use client';
import * as React from "react";

interface Props {
  scriptStr: string;
  id?: string;
}

function InlinedScript(props: Props) {
  const _context = { ...props["_context"] };

  return (
    <script
      dangerouslySetInnerHTML={{ __html: props.scriptStr }}
      id={props.id}
    />
  );
}

export default InlinedScript;
