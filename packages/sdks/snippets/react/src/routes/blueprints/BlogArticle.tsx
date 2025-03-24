import {
  BuilderContent,
  Content,
  fetchOneEntry,
  isPreviewing,
} from '@builder.io/sdk-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const model = 'blog-article';
const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

export default function BlogArticle() {
  const [article, setArticle] = useState<BuilderContent | null>();
  const { handle } = useParams();
  console.log(article);
  useEffect(() => {
    fetchOneEntry({
      model,
      apiKey,
      query: {
        'data.handle': handle,
      },
    }).then((result) => {
      setArticle(result);
    });
  }, [handle]);

  if (!article && !isPreviewing()) {
    return <div>404</div>;
  }

  return (
    article?.data && (
      <div className="content">
        <h1>{article.data.title}</h1>
        <p>{article.data.blurb}</p>
        <img src={article.data.image} />
        <Content model={model} content={article} apiKey={apiKey} />
      </div>
    )
  );
}
