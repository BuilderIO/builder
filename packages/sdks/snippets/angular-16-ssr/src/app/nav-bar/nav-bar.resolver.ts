import { ResolveFn } from '@angular/router';
import { fetchOneEntry, type BuilderContent } from '@builder.io/sdk-angular';

export const navBarResolver: ResolveFn<BuilderContent> = async () => {
  const links = await fetchOneEntry({
    model: 'navigation-links',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
  });

  return links || { data: { links: [] } };
};
