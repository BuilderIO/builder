'use client';
import * as React from 'react';

export interface RawTextProps {
  attributes?: any;
  text?: string;
  // builderBlock?: any;
}

function RawText(props: RawTextProps) {
  return (
    <span
      className={props.attributes?.class || props.attributes?.className}
      dangerouslySetInnerHTML={{ __html: props.text || '' }}
    />
  );
}

export default RawText;
