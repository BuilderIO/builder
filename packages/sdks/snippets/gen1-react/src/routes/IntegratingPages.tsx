/**
 * Quickstart snippet
 * snippets/gen1-react/src/routes/IntegratingPages.tsx
 */
import { BuilderComponent, builder, useIsPreviewing } from '@builder.io/react';
import { useEffect, useState } from 'react';
import FourOhFour from '../components/404';

builder.init('ee9f13b4981e489a9a1209887695ef2b');

export default function IntegratingPages() {
  const isPreviewingInBuilder = useIsPreviewing();
  const [notFound, setNotFound] = useState(false);
  const [content, setContent] = useState();

  useEffect(() => {
    async function fetchContent() {
      const content = await builder
        .get('page', {
          url: window.location.pathname,
        })
        .promise();

      setContent(content);
      setNotFound(!content);

      if (content?.data.title) {
        document.title = content.data.title;
      }
    }
    fetchContent();
  }, [window.location.pathname]);

  if (notFound && !isPreviewingInBuilder) {
    return <FourOhFour />;
  }

  return <BuilderComponent model="page" content={content} />;
}
