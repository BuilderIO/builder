import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import {
  BuilderContent,
  fetchOneEntry,
  getBuilderSearchParams,
} from '@builder.io/sdk-angular';

export const announcementBarResolver: ResolveFn<BuilderContent | null> = (
  route: ActivatedRouteSnapshot
) => {
  const urlPath = `/${route.url.join('/')}`;
  const searchParams = getBuilderSearchParams(route.queryParams);

  return fetchOneEntry({
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    model: 'announcement-bar',
    userAttributes: {
      urlPath,
    },
    options: searchParams,
  });
};
