'use client';
import * as React from "react";

export interface TextProps {
  text?: string;
}

function Text(props: TextProps) {
  const _context = { ...props["_context"] };

  return (
    <span
      className="builder-text"
      dangerouslySetInnerHTML={{ __html: props.text?.toString() }}
      style={{
        outline: "none",
      }}
    />
  );
}

export default Text;
