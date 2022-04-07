import { isBrowser } from './is-browser';
import { isEditing } from './is-editing';
import { isReactNative } from './is-react-native';

export function track(event: string, properties: Record<string, any>) {
  if (isEditing()) {
    return;
  }
  if (!(isBrowser() || isReactNative())) {
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
