import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { fetchOneEntry, type BuilderContent } from '@builder.io/sdk-angular';

export const catchAllResolver: ResolveFn<BuilderContent | null> = async (
  route: ActivatedRouteSnapshot
) => {
  const urlPath = `/${route.url.join('/')}`;
  const searchParams = route.queryParams;

  return await fetchOneEntry({
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    model: 'page',
    userAttributes: {
      urlPath,
    },
    options: searchParams,
  });
};
