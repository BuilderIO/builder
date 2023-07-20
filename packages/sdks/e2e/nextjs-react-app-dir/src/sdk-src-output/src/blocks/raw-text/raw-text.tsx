'use client';
import * as React from "react";

export interface RawTextProps {
  attributes?: any;
  text?: string;
  // builderBlock?: any;
}

function RawText(props: RawTextProps) {
  const _context = { ...props["_context"] };

  return (
    <span
      className={props.attributes?.class || props.attributes?.className}
      dangerouslySetInnerHTML={{ __html: props.text || "" }}
    />
  );
}

export default RawText;
