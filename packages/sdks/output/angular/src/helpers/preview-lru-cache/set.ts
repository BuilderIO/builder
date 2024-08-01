import type { BuilderContent } from '../../types/builder-content';
export async function postPreviewContent({
  key,
  value
}: {
  key: string;
  value: BuilderContent;
}) {
  return {
    [key]: value
  };
}