import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { _processContentResult, fetchOneEntry } from '@builder.io/sdk-angular';
import { getProps } from '@sdk/tests';

export const appResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const urlPath = `/${route.url.join('/')}`;

  return getProps({
    pathname: urlPath,
    _processContentResult,
    fetchOneEntry,
  });
};
