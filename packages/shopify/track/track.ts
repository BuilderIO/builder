import { builder } from '@builder.io/sdk';
import { Checkout } from './interfaces/checkout';

const TRACKED_KEY = 'builder.tracked';

function getQueryParam(url: string, variable: string): string | null {
  const query = url.split('?')[1] || '';
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  return null;
}

const _window = window as any;

if (!_window[TRACKED_KEY]) {
  const apiKey =
    getQueryParam((document.currentScript as HTMLScriptElement).src || '', 'apiKey') ||
    builder.apiKey;

  if (apiKey && !builder.apiKey) {
    builder.apiKey = apiKey;
  }

  const { Shopify } = _window;

  if (!apiKey) {
    console.debug('No apiKey for Builder JS', document.currentScript);
  } else if (!Shopify) {
    console.debug('No Shopify object');
  } else {
    _window[TRACKED_KEY] = true;
    const checkout: Checkout | null = Shopify.checkout;
    if (checkout) {
      builder.track('checkout', {
        meta: checkout,
        amount: parseFloat(checkout.payment_due),
      });
      for (const item of checkout.line_items) {
        const id = item.id;
        const cookieValue = builder.getCookie('builder.addToCart.' + id);
        if (cookieValue) {
          // Remove the cookie by setting a cooke to a date in the past
          builder.setCookie('builder.addToCart.' + id, '', new Date(0));

          const [contentId, variationId] = cookieValue.split(',');
          builder.track('conversion', {
            contentId,
            variationId,
            meta: item,
            amount: parseFloat(item.price), // x item.quantity?
          });
        }
      }
    }
  }
}
