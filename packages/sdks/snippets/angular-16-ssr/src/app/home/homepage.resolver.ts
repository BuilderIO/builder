import { ResolveFn } from '@angular/router';
import { BuilderContent, fetchOneEntry } from '@builder.io/sdk-angular';

export const homepageResolver: ResolveFn<BuilderContent | null> = async () => {
  return await fetchOneEntry({
    model: 'homepage',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
  });
};