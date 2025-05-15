import { setClientUserAttributes } from '@builder.io/sdk-react';

export default function setTargetingAttributes() {
  setClientUserAttributes({
    device: 'desktop',
    audience: ['recent-shopper', 'womens-fashion'],
  });
}
