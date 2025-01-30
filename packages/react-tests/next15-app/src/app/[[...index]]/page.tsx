import { builder } from '@builder.io/sdk';
import { RenderBuilderContent } from '../../components/builder';
import { getAPIKey, getProps } from '@sdk/tests';

if (typeof window !== 'undefined') {
  const pathname = window.location.pathname;
  if (pathname.includes('can-track-false-pre-init')) {
    builder.canTrack = false;
  }
}

builder.init(getAPIKey());

type Next15Params = Promise<{ index: string[] }>;

export default async function Page(props: { params: Next15Params }) {
  const params = await props.params;
  const builderProps = await getProps({ pathname: '/' + (params?.index?.join('/') || '') });

  return <RenderBuilderContent {...builderProps} />;
}
