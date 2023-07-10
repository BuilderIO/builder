'use client';
import * as React from 'react';

export interface FragmentProps {
  maxWidth?: number;
  attributes?: any;
  children?: any;
}

function FragmentComponent(props: FragmentProps) {
  return <span>{props.children}</span>;
}

export default FragmentComponent;
