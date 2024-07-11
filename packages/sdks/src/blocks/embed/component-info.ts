import type { ComponentInfo } from '../../types/components.js';

// Provided by the web app as a local variable in onChange functions
declare const _iframelyApiKey: string;

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
      onChange: (options: Map<string, any>): void | Promise<void> => {
        const url = options.get('url');
        if (url) {
          options.set('content', 'Loading...');

          const apiKey = _iframelyApiKey;
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
      },
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
