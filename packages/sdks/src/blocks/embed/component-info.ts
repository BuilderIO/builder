import type { ComponentInfo } from '../../types/components';
import { serializeFn } from '../util.js';

export const componentInfo: ComponentInfo = {
  name: 'Embed',
  static: true,

  inputs: [
    {
      name: 'url',
      type: 'url',
      required: true,
      defaultValue: '',
      helperText: 'e.g. enter a youtube url, google map, etc',
      onChange: serializeFn(
        (options: Map<string, any>): void | Promise<void> => {
          const url = options.get('url');
          if (url) {
            options.set('content', 'Loading...');
            // TODO: get this out of here!
            const apiKey = 'ae0e60e78201a3f2b0de4b';
            return fetch(
              `https://iframe.ly/api/iframely?url=${url}&api_key=${apiKey}`
            )
              .then((res) => res.json())
              .then((data) => {
                if (options.get('url') === url) {
                  if (data.html) {
                    options.set('content', data.html);
                  } else {
                    options.set('content', 'Invalid url, please try another');
                  }
                }
              })
              .catch((_err) => {
                options.set(
                  'content',
                  'There was an error embedding this URL, please try again or another URL'
                );
              });
          } else {
            options.delete('content');
          }
        }
      ),
    },
    {
      name: 'content',
      type: 'html',
      defaultValue:
        '<div style="padding: 20px; text-align: center">(Choose an embed URL)<div>',
      hideFromUI: true,
    },
  ],
};
