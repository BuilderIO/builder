import {
  BuilderContent,
  Content,
  fetchOneEntry,
  isPreviewing,
} from '@builder.io/sdk-react';
import { useEffect, useState } from 'react';

const MODEL_NAME = 'blog-article';
const BUILDER_API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export default function BlogArticle() {
  const [article, setArticle] = useState<BuilderContent | null>(null);

  useEffect(() => {
    fetchOneEntry({
      model: MODEL_NAME,
      apiKey: BUILDER_API_KEY,
      userAttributes: {
        urlPath: window.location.pathname,
      },
    }).then((result) => {
      setArticle(result);
    });
  }, []);

  if (!article && !isPreviewing()) {
    return <div>404 - Not Found</div>;
  }

  return (
    article?.data && (
      <div className="content">
        <h1>{article.data.title}</h1>
        <p>{article.data.blurb}</p>
        <img alt={article.data.title} src={article.data.image} />
        <Content
          model={MODEL_NAME}
          content={article}
          apiKey={BUILDER_API_KEY}
        />
      </div>
    )
  );
}
