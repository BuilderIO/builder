/**@jsx jsx */
import { jsx } from '@emotion/core';
import { withBuilder } from '@builder.io/react';
import * as React from 'react';

const logoWhite = require('../assets/logo-white.png');
const logoDark = require('../assets/logo.png');

export interface AnimatedLogoProps {
  size?: number;
  opacity?: number;
  light?: boolean;
}

function AnimatedLogoComponent(props: AnimatedLogoProps) {
  const logo = props.light ? logoWhite : logoDark;
  return (
    <div
      css={{
        padding: 12,
        height: props.size || 50,
        // width: props.size || 50,
      }}
    >
      <img
        css={{
          opacity: props.opacity || 1,
          maxWidth: '100%',
          maxHeight: '100%',
        }}
        src={logo}
      />
    </div>
  );
}

export const AnimatedLogo = withBuilder(AnimatedLogoComponent, {
  name: 'Animated Logo',
  inputs: [
    { name: 'size', type: 'number', defaultValue: 50 },
    { name: 'opacity', type: 'number', advanced: true, defaultValue: 40 },
  ],
});
