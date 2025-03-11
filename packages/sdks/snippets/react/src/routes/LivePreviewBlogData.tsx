import {
  BuilderContent,
  fetchOneEntry,
  subscribeToEditor,
} from '@builder.io/sdk-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

function LivePreviewBlogData() {
  const [content, setContent] = useState<BuilderContent | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const slug = location.pathname;

  useEffect(() => {
    fetchOneEntry({
      model: 'blog-data',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',

      userAttributes: {
        urlPath: slug,
      },
    })
      .then((data) => {
        setContent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(
          'something went wrong while fetching Builder Content: ',
          err
        );
      });

    //subscribe to live updates
    const unsubscribe = subscribeToEditor({
      model: 'blog-data',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      callback: (content) => {
        setContent(content);
      },
    });
    //unsubscribe from live updates
    return () => {
      unsubscribe();
    };
  }, [slug]);

  if (!content && !loading) {
    return <div>Loading Data...</div>;
  }

  return (
    <>
      {/* Live preview the blog data in the browser without publishing */}
      <div className="blog-data-preview">
        <div>Blog Title: {content?.data?.title}</div>
        <div>Authored by: {content?.data?.author}</div>
        <div>Handle: {content?.data?.handle}</div>
      </div>
    </>
  );
}

export default LivePreviewBlogData;
