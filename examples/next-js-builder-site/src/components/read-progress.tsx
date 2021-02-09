import React, { useState } from 'react';
import useEventListener from 'use-typed-event-listener';
import { Builder } from '@builder.io/react';

export type ReadProgressProps = {
  className?: string;
  containerSelector?: string;
};

function getScrollPrecent(containerSelector?: string) {
  if (Builder.isServer) {
    return 0;
  }
  // If for some reason we can't get the container size, an arbitrary
  // size like 500 is better than assuming 0;
  const defaultContainerImplicitSize = 500;

  const buffer = window.innerHeight;
  const container = containerSelector
    ? document.querySelector(containerSelector)
    : document.body;
  const containerHeight =
    (container?.scrollHeight || defaultContainerImplicitSize) - buffer;
  return Math.max(Math.min((window.scrollY / containerHeight) * 100, 100), 0);
}

export function ReadProgress(props: ReadProgressProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  if (Builder.isBrowser) {
    useEventListener(
      window,
      'scroll',
      () => {
        setScrollProgress(getScrollPrecent(props.containerSelector));
      },
      { passive: true },
    );
  }

  return (
    <div
      className={props.className}
      css={{
        position: 'sticky',
        top: 0,
        width: '100%',
        zIndex: 100,
        pointerEvents: 'none',
        height: 7,
        flexShrink: 0,
        left: 0,
      }}
    >
      <div
        style={{
          // Put this in `style` bc it changes so frequently we don't want emotion to make a million style tags
          width: `${scrollProgress}%`,
        }}
        css={{
          position: 'absolute',
          height: '100%',
          borderRadius: 5,
          backgroundImage:
            'linear-gradient(160deg,rgb(210,238,245) -25%,rgb(1,185,241) 29%,rgb(0,126,193) 115%)',
        }}
      />
    </div>
  );
}
