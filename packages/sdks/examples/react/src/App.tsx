import {
  Content,
  fetchOneEntry,
  isPreviewing,
  getBuilderSearchParams,
  type BuilderContent,
} from '@builder.io/sdk-react';
import { useEffect, useState } from 'react';

// set whether you're using the Visual Editor,
// whether there are changes,
// and render the content if found
export default function App() {
  const [notFound, setNotFound] = useState(false);
  const [content, setContent] = useState<BuilderContent | null>(null);

  // get the page content from Builder
  useEffect(() => {
    fetchOneEntry({
      model: 'page',
      apiKey: '75515d9050724317bfaeb81ca89328c9',
      userAttributes: {
        urlPath: window.location.pathname,
      },
      options: getBuilderSearchParams(new URL(location.href).searchParams),
    })
      .then((content) => {
        if (content) {
          setContent(content);
        }
        setNotFound(!content);
      })
      .catch((err) => {
        console.log('Oops: ', err);
      });
  }, []);

  // If no page is found, return
  // a 404 page from your code.
  if (notFound && !isPreviewing()) {
    return <div>404</div>;
  }

  // return the page when found
  return (
    <Content
      content={content}
      model="page"
      apiKey={'75515d9050724317bfaeb81ca89328c9'}
    />
  );
}
