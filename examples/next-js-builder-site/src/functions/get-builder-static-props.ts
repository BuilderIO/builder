import { USE_CODEGEN } from '@/constants/use-codegen';
import { builder } from '@builder.io/react';
import { GetStaticPropsContext } from 'next';

export const getBuilderStaticProps = async (
  modelName: string,
  context: GetStaticPropsContext,
) => {
  const path = `/${(context.params?.page as string[])?.join('/') || ''}`;
  // Don't target on url and device for better cache efficiency
  const targeting = { urlPath: '_', device: '_' } as any;

  const page = await builder
    .get(modelName, {
      userAttributes: { ...targeting, urlPath: path },
      ...(!USE_CODEGEN
        ? {}
        : {
            format: 'react',
          }),
    })
    .promise();

  // If there is a Builder page for this URL, this will be an object, otherwise it'll be null
  return {
    props: { builderPage: page || null },
    revalidate: true,
    notFound: !page,
  };
};
