import { builder } from '@builder.io/react';

export default function setTargetingAttributes() {
  builder.setUserAttributes({
    device: 'desktop',
    audience: ['recent-shopper', 'womens-fashion'],
  });
}
