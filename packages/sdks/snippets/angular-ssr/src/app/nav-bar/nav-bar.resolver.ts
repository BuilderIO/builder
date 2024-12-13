import { ResolveFn } from '@angular/router';
import { fetchEntries, type BuilderContent } from '@builder.io/sdk-angular';

export const navBarResolver: ResolveFn<BuilderContent[]> = async () => {
  const links = await fetchEntries({
    model: 'nav-link',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
  });

  return links;
};
