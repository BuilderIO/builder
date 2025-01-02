import { ResolveFn, RouterStateSnapshot } from '@angular/router';

import { ActivatedRouteSnapshot } from '@angular/router';
import { fetchOneEntry } from '@builder.io/sdk-angular';

export const advancedChildResolver: ResolveFn<any> = async (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return await fetchOneEntry({
    model: 'page',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    userAttributes: {
      urlPath: state.url,
    },
  });
};
