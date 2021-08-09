import { withBuilder } from '@builder.io/react';
import * as React from 'react';
import Image from 'next/image';

const logoWhite = '/assets/logo-white.png';
const logoDark = '/assets/logo.png';

export interface AnimatedLogoProps {
  size?: number;
  opacity?: number;
  light?: boolean;
}

function LogoComponent(props: AnimatedLogoProps) {
  const logo = props.light ? logoWhite : logoDark;
  return (
    <div
      css={{
        padding: 12,
        height: props.size || 50,
        // width: props.size || 50,
      }}
    >
      <Image
        width="606"
        height="599"
        css={{
          opacity: props.opacity || 1,
          width: '100%',
          height: '100%',
        }}
        src={logo}
      />
    </div>
  );
}

export const AnimatedLogo = withBuilder(LogoComponent, {
  // Legacy name, for backwards compatability
  name: 'Animated Logo',
  inputs: [
    { name: 'size', type: 'number', defaultValue: 50 },
    { name: 'opacity', type: 'number', advanced: true, defaultValue: 40 },
  ],
});
