/**
 * Quickstart snippet
 * snippets/gen1-react/src/routes/IntegratingPages.tsx
 */
import { BuilderComponent, builder, useIsPreviewing } from '@builder.io/react';
import { useEffect, useState } from 'react';
import FourOhFour from '../components/404';

// Put your API key here
builder.init('ee9f13b4981e489a9a1209887695ef2b');

// set whether you're using the Visual Editor,
// whether there are changes,
// and render the content if found
export default function IntegratingPages() {
  const isPreviewingInBuilder = useIsPreviewing();
  const [notFound, setNotFound] = useState(false);
  const [content, setContent] = useState();

  // get the page content from Builder
  useEffect(() => {
    async function fetchContent() {
      const content = await builder
        .get('page', {
          url: window.location.pathname,
        })
        .promise();

      setContent(content);
      setNotFound(!content);

      // if the page title is found,
      // set the document title
      if (content?.data.title) {
        document.title = content.data.title;
      }
    }
    fetchContent();
  }, [window.location.pathname]);

  // If no page is found, return
  // a 404 page from your code.
  if (notFound && !isPreviewingInBuilder) {
    return <FourOhFour />;
  }

  // return the page when found
  return (
    <>
      {/* Render the Builder page */}
      <BuilderComponent model="page" content={content} />
    </>
  );
}
