import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import {
  _processContentResult,
  fetchOneEntry,
  getBuilderSearchParams,
} from '@builder.io/sdk-angular';
import { getProps } from '@sdk/tests';

export const appResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const urlPath = `/${route.url.join('/')}`;
  const searchParams = getBuilderSearchParams(route.queryParams);

  return getProps({
    pathname: urlPath,
    _processContentResult,
    options: searchParams,
    fetchOneEntry,
  });
};
