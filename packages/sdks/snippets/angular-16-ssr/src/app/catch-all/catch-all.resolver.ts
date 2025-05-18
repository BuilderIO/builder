import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { fetchOneEntry, isPreviewing } from '@builder.io/sdk-angular';

export const catchAllResolver: ResolveFn<BuilderContent | null> = (
  route: ActivatedRouteSnapshot
) => {
  const urlPath = `/${route.url.join('/')}`;
  const searchParams = route.queryParams;

  const canShowContent = isPreviewing(searchParams);

  if (!canShowContent) {
    return {
      notFound: true,
    };
  }

  return fetchOneEntry({
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    model: 'page',
    userAttributes: {
      urlPath,
    },
    options: searchParams,
  });
};
