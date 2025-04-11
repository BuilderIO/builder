import {
  BuilderContent,
  Content,
  fetchOneEntry,
  isPreviewing,
} from '@builder.io/sdk-react';
import { useEffect, useState } from 'react';

export default function Homepage() {
  const [content, setContent] = useState<BuilderContent | null>(null);

  useEffect(() => {
    fetchOneEntry({
      model: 'homepage',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    }).then((content) => setContent(content));
  }, []);

  if (!content && !isPreviewing()) {
    return <div>404</div>;
  }

  return (
    <Content
      apiKey="ee9f13b4981e489a9a1209887695ef2b"
      model="homepage"
      content={content}
    />
  );
}
