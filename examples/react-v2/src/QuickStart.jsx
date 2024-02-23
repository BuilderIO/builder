import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-react';
import { useEffect, useState } from 'react';

// set whether you're using the Visual Editor,
// whether there are changes,
// and render the content if found
export default function CatchAllRoute() {
  const [notFound, setNotFound] = useState(false);
  const [content, setContent] = useState(null);

  // get the page content from Builder
  useEffect(() => {
    fetchOneEntry({
      model: 'page',
      apiKey: BUILDER_PUBLIC_API_KEY,
      userAttributes: {
        urlPath: window.location.pathname || '/',
      },
    })
      .then(content => {
        if (content) {
          setContent(content);
        }
        setNotFound(!content);
      })
      .catch(err => {
        console.log('something went wrong while fetching Builder Content: ', err);
      });
  }, []);

  // If no page is found, return
  // a 404 page from your code.
  // The following hypothetical
  // <FourOhFour> is placeholder.
  if (notFound && !isPreviewing()) {
    return <FourOhFour />;
  }

  // return the page when found
  return <Content content={content} model="page" apiKey={BUILDER_PUBLIC_API_KEY} />;
}

// TODO: enter your public API
