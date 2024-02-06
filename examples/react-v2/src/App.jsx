import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-react';
import { useEffect, useState } from 'react';

// TODO: enter your public API key
const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

function App() {
  const [content, setContent] = useState(undefined);

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
      })
      .catch(err => {
        console.log('something went wrong while fetching Builder Content: ', err);
      });
  }, []);

  const shouldRenderBuilderContent = content || isPreviewing();

  return shouldRenderBuilderContent ? (
    <Content content={content} model="page" apiKey={BUILDER_PUBLIC_API_KEY} />
  ) : (
    <div>Content Not Found</div>
  );
}

export default App;
