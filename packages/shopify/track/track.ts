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

function datePlusMinutes(minutes = 30) {
  return new Date(Date.now() + minutes * 60000);
}

if (!_window[TRACKED_KEY]) {
  const apiKey =
    getQueryParam((document.currentScript as HTMLScriptElement)?.src || '', 'apiKey') ||
    builder.apiKey;

  if (apiKey && !builder.apiKey) {
    builder.apiKey = apiKey;
  }

  // Allow passing a session ID to the tracking script to support cross domain converison tracking
  // AKA: <script src="https://cdn.builder.io/js/shopify/track?apiKey=YOUR_KEY&sessionId={{checkout.attributes._builderSessionId}}">
  const sessionIdParam = getQueryParam(
    (document.currentScript as HTMLScriptElement)?.src || '',
    'sessionId'
  );
  if (sessionIdParam) {
    builder.sessionId = sessionIdParam;
  }

  builder.track('pageview');
  _window[TRACKED_KEY] = true;

  const { Shopify } = _window;

  if (!apiKey) {
    console.debug('No apiKey for Builder JS', document.currentScript);
  } else if (!Shopify) {
    console.debug('No Shopify object');
  } else if (Shopify.checkout?.order_id) {
    // rely on updated_at since created_at is not accurate
    const orderUpdatedAt = new Date(Shopify.checkout.updated_at);

    const orderUpdatedMinutesAgo = (Date.now() - orderUpdatedAt.getTime()) / 1000 / 60;

    // Order is not old
    if (orderUpdatedMinutesAgo < 3) {
      const trackedOrdersCookieKey = `builder.trackedOrders.${Shopify.checkout.order_id}`;
      const orderWasTracked = builder.getCookie(trackedOrdersCookieKey);

      if (!orderWasTracked) {
        const checkout: Partial<Checkout> = {
          ...Shopify.checkout,
          email: undefined,
          shipping_address: undefined,
          billing_address: undefined,
          credit_card: undefined,
        };

        builder.setCookie(trackedOrdersCookieKey, datePlusMinutes(60));

        builder.track('conversion', {
          meta: checkout,
          amount: parseFloat(checkout.subtotal_price!), // TODO: normalize currency
        });
      }
    }
  }
}
