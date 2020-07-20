import { keyframes } from '@emotion/core';
import { el } from '../modules/blocks';

const spinKeyframes = keyframes({
  '0%': {
    transform: 'rotate(0)',
  },
  '100%': {
    transform: 'rotate(360deg)',
  },
});

export const loadingSpinner = el({
  layerName: 'Loading spinner',
  layerLocked: true,
  responsiveStyles: {
    large: {
      width: '4em',
      height: '4em',
      borderRadius: '50%',
      position: 'relative',
      margin: '6rem auto',
      fontSize: '1rem',
      textIndent: '-9999em',
      borderTop: '0.2em solid rgba(131, 132, 137, 0.2)',
      borderRight: '0.2em solid rgba(131, 132, 137, 0.2)',
      borderBottom: '0.2em solid rgba(131, 132, 137, 0.2)',
      borderLeft: '0.2em solid #454749',
      transform: 'translateZ(0)',
      animationIterationCount: 'infinite',
      animationTimingFunction: 'inear',
      animationDuration: '1.1s',
      animationName: spinKeyframes.toString(),
    },
  },
});
