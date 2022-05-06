import { isPreviewing } from './is-previewing.js';

export function previewingModelName() {
  if (!isPreviewing()) {
    return null;
  }
  const url = new URL(location.href);
  return url.searchParams.get('builder.preview');
}
