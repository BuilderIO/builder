import { ResolveFn } from '@angular/router';
import { fetchOneEntry } from '@builder.io/sdk-angular';

export const customChildResolver: ResolveFn<any> = async () => {
  const content = await fetchOneEntry({
    model: 'page',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    userAttributes: {
      urlPath: window.location.pathname,
    },
  });

  return content;
};
