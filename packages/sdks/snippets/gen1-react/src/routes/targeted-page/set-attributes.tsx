import { BuilderComponent, builder, useIsPreviewing } from '@builder.io/react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FourOhFour from '../../components/404';
import setTargetingAttributes from './setUserAttributes';

const MODEL = 'targeted-page';
builder.init('ee9f13b4981e489a9a1209887695ef2b');

export default function TargetedPageSetAttributes() {
  const isPreviewingInBuilder = useIsPreviewing();
  const [notFound, setNotFound] = useState(false);
  const [content, setContent] = useState();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    async function fetchContent() {
      const target: string = searchParams.get('target') || '';

      if (target === 'set-attributes') {
        setTargetingAttributes();
      }

      const content = await builder.get(MODEL, {
        url: window.location.pathname,
      });

      setContent(content);
      setNotFound(!content);

      if (content?.data.title) {
        document.title = content.data.title;
      }
    }
    fetchContent();
  }, []);

  if (notFound && !isPreviewingInBuilder) {
    return <FourOhFour />;
  }

  return (
    <>
      <h1>Targeting Snippet : Set Attributes</h1>
      <hr />
      <BuilderComponent model={MODEL} content={content} />
    </>
  );
}
