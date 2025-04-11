import {fetchOneEntry, Content} from '@builder.io/sdk-react';
import {useLoaderData} from '@remix-run/react';
import {type LoaderFunction} from '@shopify/remix-oxygen';

export const loader: LoaderFunction = async ({params}) => {
  const content = await fetchOneEntry({
    model: 'collection-hero',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    userAttributes: {urlPath: params.pathname},
  });

  return {content};
};

export default function ProductHero() {
  const {content} = useLoaderData<typeof loader>();

  return (
    <div>
      {/* Your nav goes here */}
      {content && (
        <Content
          model="collection-hero"
          content={content}
          apiKey="ee9f13b4981e489a9a1209887695ef2b"
        />
      )}
      {/* The rest of your page goes here */}
    </div>
  );
}
