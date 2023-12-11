import * as React from "react";

export interface TextProps {
  text?: string;
}

function Text(props: TextProps) {
  return (
    <div
      className="builder-text"
      dangerouslySetInnerHTML={{ __html: props.text?.toString() || "" }}
      style={{
        outline: "none",
      }}
    />
  );
}

export default Text;
