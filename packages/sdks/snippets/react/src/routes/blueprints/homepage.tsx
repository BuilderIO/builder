import {
  BuilderContent,
  Content,
  fetchOneEntry,
  isPreviewing,
} from '@builder.io/sdk-react';
import { useEffect, useState } from 'react';

const BUILDER_API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';
const MODEL_NAME = 'homepage';

export default function Homepage() {
  const [content, setContent] = useState<BuilderContent | null>(null);

  useEffect(() => {
    fetchOneEntry({
      model: MODEL_NAME,
      apiKey: BUILDER_API_KEY,
    }).then((content) => setContent(content));
  }, []);

  if (!content && !isPreviewing()) {
    return <div>404</div>;
  }

  return (
    <Content apiKey={BUILDER_API_KEY} model={MODEL_NAME} content={content} />
  );
}
