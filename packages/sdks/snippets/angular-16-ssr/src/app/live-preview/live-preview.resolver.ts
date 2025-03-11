import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { BuilderContent, fetchOneEntry } from '@builder.io/sdk-angular';

export const livePreviewResolver: ResolveFn<BuilderContent | null> = (
  route: ActivatedRouteSnapshot
) => {
  const urlPath = `/${route.url.join('/')}`;

  return fetchOneEntry({
    model: 'blog-data',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    userAttributes: {
      urlPath,
    },
  });
};
