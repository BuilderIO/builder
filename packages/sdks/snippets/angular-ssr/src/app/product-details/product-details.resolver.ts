import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { fetchOneEntry } from '@builder.io/sdk-angular';

export const productDetailsResolver: ResolveFn<any> = async (
  route: ActivatedRouteSnapshot
) => {
  const handle = route.paramMap.get('handle') || 'jacket';

  const productDetails = await fetchOneEntry({
    model: 'product-details',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    query: {
      'data.handle': handle,
    },
  });

  return productDetails;
};