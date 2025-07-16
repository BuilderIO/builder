import { BuilderContent, Content, fetchOneEntry } from '@builder.io/sdk-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import setTargetingAttributes from './setUserAttributes';

const MODEL = 'targeted-page';
const BUILDER_API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export default function TargetedPageSetAttributes() {
  const [content, setContent] = useState<BuilderContent | null>();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    async function fetchContent() {
      const target: string = searchParams.get('target') || '';
      const options = {
        apiKey: BUILDER_API_KEY,
        model: MODEL,
        userAttributes: {
          urlPath: window.location.pathname,
        },
      };

      if (target === 'set-attributes') {
        setTargetingAttributes();
      }

      const content = await fetchOneEntry(options);
      setContent(content);

      if (content?.data?.title) {
        document.title = content.data.title;
      }
    }
    fetchContent();
  }, [searchParams]);

  return (
    <>
      <h1>Targeting Snippet</h1>
      <hr />
      <Content apiKey={BUILDER_API_KEY} model={MODEL} content={content} />
    </>
  );
}
