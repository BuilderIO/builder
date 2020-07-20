import React from 'react';
import './elements';

interface BuilderFiddleElement extends HTMLElement {}

interface BuilderFiddleProps {
  entry?: string;
  onLoad?: () => void;
  ref?: (ref: BuilderFiddleElement | null) => void;
}

const TAG_NAME: string = 'builder-fiddle';

export const BuilderFiddle = (props: BuilderFiddleProps) => <TAG_NAME {...(props as any)} />;
