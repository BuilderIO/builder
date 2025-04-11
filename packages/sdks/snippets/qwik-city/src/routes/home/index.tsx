import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-qwik';

export const useHomepage = routeLoader$(async () => {
  return await fetchOneEntry({
    model: 'homepage',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
  });
});

export default component$(() => {
  const content = useHomepage();

  if (!content.value && !isPreviewing()) {
    return <div>404</div>;
  }

  return (
    <div>
      <Content
        model="homepage"
        content={content.value}
        apiKey="ee9f13b4981e489a9a1209887695ef2b"
      />
    </div>
  );
});
