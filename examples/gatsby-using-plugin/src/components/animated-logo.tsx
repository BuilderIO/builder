import { Builder } from '@builder.io/react';
import * as React from 'react';

import logoWhite from './assets/logo-white.png';
import logoDark from './assets/logo.png';

console.log('ijhfiowj  ', logoWhite);

export interface AnimatedLogoProps {
  size?: number;
  opacity?: number;
  light?: boolean;
}

function AnimatedLogoComponent(props: AnimatedLogoProps) {
  const logo = props.light ? logoWhite : logoDark;
  return (
    <div
      style={{
        height: props.size || 50,
        width: props.size || 50,
        padding: 12
      }}
    >
      <img
        style={{
          opacity: props.opacity || 1,
          maxWidth: '100%',
          maxHeight: '100%'
        }}
        src={logo}
      />
    </div>
  );
}

Builder.registerComponent(AnimatedLogoComponent, {
  name: 'Animated Logo',
  inputs: [
    { name: 'size', type: 'number', defaultValue: 50 },
    { name: 'opacity', type: 'number', advanced: true, defaultValue: 40 }
  ]
});
