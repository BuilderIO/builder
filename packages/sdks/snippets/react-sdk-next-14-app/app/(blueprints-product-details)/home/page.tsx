import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-react';

const model = 'homepage';
const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

export default async function ProductHeroPage() {
  const content = await fetchOneEntry({
    model,
    apiKey,
  });

  return content || isPreviewing() ? (
    <Content model={model} content={content} apiKey={apiKey} />
  ) : (
    <div>404</div>
  );
}
