import type { ResolveFn } from '@angular/router';
import { BuilderContent, fetchOneEntry } from '@builder.io/sdk-angular';

export const blogArticleResolver: ResolveFn<
  BuilderContent | null
> = async () => {
  return fetchOneEntry({
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    model: 'blog-article',
    query: {
      'data.handle': 'new-product-line',
    },
  });
};
