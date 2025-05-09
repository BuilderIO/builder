import {fetchOneEntry, Content, isPreviewing} from '@builder.io/sdk-react';
import {useLoaderData} from '@remix-run/react';
import {type LoaderFunction} from '@shopify/remix-oxygen';

const MODEL = 'collection-hero';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export const loader: LoaderFunction = async ({params}) => {
  const content = await fetchOneEntry({
    model: MODEL,
    apiKey: API_KEY,
    userAttributes: {urlPath: params.pathname},
  });

  return {content};
};

export default function ProductHero() {
  const {content} = useLoaderData<typeof loader>();

  return (
    <div>
      {/* Your nav goes here */}
      {/* Hero Section */}
      {content || isPreviewing() ? (
        <Content model={MODEL} content={content} apiKey={API_KEY} />
      ) : (
        <div>404</div>
      )}
      {/* The rest of your page goes here */}
    </div>
  );
}
