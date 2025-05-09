import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-react';

const MODEL = 'homepage';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export default async function ProductHeroPage() {
  const content = await fetchOneEntry({
    model: MODEL,
    apiKey: API_KEY,
  });

  return content || isPreviewing() ? (
    <Content model={MODEL} content={content} apiKey={API_KEY} />
  ) : (
    <div>404</div>
  );
}
