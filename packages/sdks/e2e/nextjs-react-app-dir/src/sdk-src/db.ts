import { fancy_store } from '@/app/api/builder-preview/db';

export const getPreviewContent = (
  searchParams: URLSearchParams | Record<string, string | string[]>
) => {
  const id = searchParams['overrides.page']
  console.log('Getting preview content', fancy_store.get(id));
  return fancy_store.get(id)
};
