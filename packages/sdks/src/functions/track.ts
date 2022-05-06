import { TARGET } from '../constants/target.js';
import { isBrowser } from './is-browser.js';
import { isEditing } from './is-editing.js';

export function track(event: string, properties: Record<string, any>) {
  if (isEditing()) {
    return;
  }
  if (!(isBrowser() || TARGET === 'reactNative')) {
    return;
  }

  return fetch(`https://builder.io/api/v1/track`, {
    method: 'POST',
    body: JSON.stringify({ events: [{ type: event, data: properties }] }),
    headers: {
      'content-type': 'application/json',
    },
    mode: 'cors',
  });
}
