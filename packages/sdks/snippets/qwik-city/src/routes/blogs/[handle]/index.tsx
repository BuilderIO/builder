import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-qwik';

const MODEL_NAME = 'blog-article';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export const useBlogArticle = routeLoader$(async ({ params }) => {
  return await fetchOneEntry({
    model: MODEL_NAME,
    apiKey: API_KEY,
    query: { 'data.handle': params.handle },
  });
});

export default component$(() => {
  const article = useBlogArticle();
  if (!article.value && !isPreviewing()) return <div>404</div>;
  return (
    <>
      {article.value?.data && (
        <div class="content">
          <h1>{article.value.data.title}</h1>
          <p>{article.value.data.blurb}</p>
          <img src={article.value.data.image} alt={article.value.data.title} />
          <Content
            model={MODEL_NAME}
            content={article.value}
            apiKey={API_KEY}
          />
        </div>
      )}
    </>
  );
});
