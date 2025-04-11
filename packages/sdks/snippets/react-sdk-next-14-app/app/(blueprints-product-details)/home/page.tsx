import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-react';

export default async function ProductHeroPage() {
  const content = await fetchOneEntry({
    model: 'homepage',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
  });

  if (!content && !isPreviewing()) {
    return <div>404</div>;
  }

  return (
    <Content
      model="homepage"
      content={content}
      apiKey="ee9f13b4981e489a9a1209887695ef2b"
    />
  );
}
