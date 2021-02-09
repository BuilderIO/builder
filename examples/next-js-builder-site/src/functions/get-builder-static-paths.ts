import { builder } from '@builder.io/react';

export const getBuilderStaticPaths = async (modelName: string) => {
  const results = await builder.getAll(modelName, {
    key: 'pages:all',
    fields: 'data.url',
    limit: 200,
    options: {
      noTargeting: true,
    },
  });

  const paths = results
    .filter((item) => !item.data?.url?.startsWith('/c/'))
    .filter((item) => item.data?.url !== '/')
    .map((item) => ({
      params: { page: (item.data?.url?.replace('/', '') || '_').split('/') },
    }));

  return {
    paths,
    fallback: true,
  };
};
