import { getBuilderSearchParams } from '..';
import type { ContentVariantsProps } from '../components/content-variants/content-variants.types';
import { fetchContent } from './get-content';
import type { GetContentOptions } from './get-content/types';

type GetBuilderPropsOptions = GetContentOptions & { url?: URL };

export const fetchBuilderProps = async (
  _args: GetBuilderPropsOptions
): Promise<ContentVariantsProps> => {
  const urlPath = _args.url
    ? _args.url.pathname
    : _args.userAttributes?.urlPath;

  const getContentArgs: GetContentOptions = {
    ..._args,
    apiKey: _args.apiKey,
    model: _args.model,
    userAttributes: {
      ..._args.userAttributes,
      ...(urlPath ? { urlPath } : {}),
    },
    options: _args.url
      ? getBuilderSearchParams(_args.url.searchParams)
      : _args.options,
  };

  return {
    apiKey: getContentArgs.apiKey,
    model: getContentArgs.model,
    content: await fetchContent(getContentArgs),
  };
};
