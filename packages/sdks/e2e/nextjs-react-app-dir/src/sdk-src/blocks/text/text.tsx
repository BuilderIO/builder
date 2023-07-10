'use client';
import * as React from 'react';

export interface TextProps {
  text: string;
}

function Text(props: TextProps) {
  return (
    <span
      className="builder-text"
      dangerouslySetInnerHTML={{ __html: props.text }}
      style={{
        outline: 'none',
      }}
    />
  );
}

export default Text;
