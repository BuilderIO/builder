import type { BuilderContent } from '../../types/builder-content.js';
export async function postPreviewContent({
  key,
  value,
}: {
  key: string;
  value: BuilderContent;
}) {
  return { [key]: value };
}
