import { fetchOneEntry, subscribeToEditor } from '@builder.io/sdk-react/browser';
import { useEffect, useState } from 'react';

// TODO: enter your public API key
const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

function DataPreview() {
  const [content, setContent] = useState(undefined);

  useEffect(() => {
    // fetch initial data
    fetchOneEntry({ model: 'coffee', apiKey: BUILDER_PUBLIC_API_KEY })
      .then(setContent)
      .catch(err => {
        console.error('something went wrong while fetching Builder Content: ', err);
      });

    // subscribe to live updates
    const unsubscribe = subscribeToEditor('coffee', data => {
      setContent(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!content) {
    return <div>Loading Data...</div>;
  }

  return (
    <>
      <div>coffee name: {content.data?.name}</div>
      <div>coffee info: {content.data?.info}</div>
    </>
  );
}

export default DataPreview;
