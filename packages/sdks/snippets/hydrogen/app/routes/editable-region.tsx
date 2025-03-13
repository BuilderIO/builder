import type {LoaderFunction} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import {Content, fetchOneEntry, isPreviewing} from '@builder.io/sdk-react';
import {customColumnsInfo} from '~/components/CustomColumns';

const MODEL_NAME = 'editable-regions';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export const loader: LoaderFunction = async ({params}) => {
  const content = await fetchOneEntry({
    model: MODEL_NAME,
    apiKey: API_KEY,
    userAttributes: {urlPath: params.pathname},
  });

  return {content};
};

export default function EditableRegionsRoute() {
  const {content} = useLoaderData<typeof loader>();

  if (!content && !isPreviewing()) {
    return <div>404</div>;
  }

  return (
    <Content
      content={content}
      model={MODEL_NAME}
      apiKey={API_KEY}
      customComponents={[customColumnsInfo]}
    />
  );
}
