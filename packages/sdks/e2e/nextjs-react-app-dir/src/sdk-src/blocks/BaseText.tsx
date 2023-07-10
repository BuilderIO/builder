'use client';
import * as React from 'react';
import type { PropsWithBuilder } from '../types/builder-props';
export interface BaseTextProps {
  text: string;
}

function BaseText(props: PropsWithBuilder<BaseTextProps>) {
  return (
    <span style={props.builderContext.inheritedStyles as any}>
      {props.text}
    </span>
  );
}

export default BaseText;
