import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-qwik';

const MODEL_NAME = 'blog-article';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export const useBlogArticle = routeLoader$(async ({ params, request }) => {
  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams);

  const content = await fetchOneEntry({
    model: MODEL_NAME,
    apiKey: API_KEY,
    query: { 'data.handle': params.handle },
  });

  return {
    content,
    searchParams,
  };
});

export default component$(() => {
  const { value } = useBlogArticle();
  const canShowContent = value?.content || isPreviewing(value?.searchParams);

  return (
    <>
      {canShowContent ? (
        <div class="content">
          <h1>{value.content?.data?.title}</h1>
          <p>{value.content?.data?.blurb}</p>
          <img
            src={value.content?.data?.image}
            alt={value.content?.data?.title}
          />
          <Content
            model={MODEL_NAME}
            content={value?.content}
            apiKey={API_KEY}
          />
        </div>
      ) : (
        <div>404</div>
      )}
    </>
  );
});
