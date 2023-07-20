'use client';
import * as React from "react";

export interface FragmentProps {
  maxWidth?: number;
  attributes?: any;
  children?: any;
}

function FragmentComponent(props: FragmentProps) {
  const _context = { ...props["_context"] };

  return <span>{props.children}</span>;
}

export default FragmentComponent;
