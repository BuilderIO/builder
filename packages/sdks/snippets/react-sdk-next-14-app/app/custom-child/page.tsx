import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-react';
import { customHeroInfo } from '../components/CustomHero';

const MODEL_NAME = 'custom-child';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export default async function Page() {
  const content = await fetchOneEntry({
    model: MODEL_NAME,
    apiKey: API_KEY,
    userAttributes: { urlPath: '/custom-child' },
  });

  if (!content && isPreviewing()) {
    return <div>404</div>;
  }

  return (
    <Content
      content={content}
      model={MODEL_NAME}
      apiKey={API_KEY}
      customComponents={[customHeroInfo]}
    />
  );
}
