import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { BuilderContent, fetchOneEntry } from '@builder.io/sdk-angular';

export const productEditorialResolver: ResolveFn<{
  product: any;
  editorial: BuilderContent | null;
}> = async (route: ActivatedRouteSnapshot) => {
  const productId = route.paramMap.get('id');
  const urlPath = `/products/${productId}`;

  const [product, editorial] = await Promise.all([
    fetch(`https://fakestoreapi.com/products/${productId}`).then((res) =>
      res.json()
    ),
    fetchOneEntry({
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      model: 'product-editorial',
      userAttributes: {
        urlPath,
      },
    }),
  ]);

  return { product, editorial };
};
