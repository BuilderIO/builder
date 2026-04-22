import type {LoaderFunction} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import {Content, fetchOneEntry, isPreviewing} from '@builder.io/sdk-react';
import {customColumnsInfo} from '~/components/CustomColumns';

const MODEL_NAME = 'editable-regions';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export const loader: LoaderFunction = async ({params, request}) => {
  const url = new URL(request.url);
  const content = await fetchOneEntry({
    model: MODEL_NAME,
    apiKey: API_KEY,
    userAttributes: {urlPath: params.pathname},
  });

  return {content, searchParams: Object.fromEntries(url.searchParams)};
};

export default function EditableRegionsRoute() {
  const {content, searchParams} = useLoaderData<{
    content: any;
    searchParams: Record<string, string>;
  }>();

  const canShowContent = content || isPreviewing(searchParams);

  return canShowContent ? (
    <Content
      content={content}
      model={MODEL_NAME}
      apiKey={API_KEY}
      customComponents={[customColumnsInfo]}
    />
  ) : (
    <div>404</div>
  );
}
