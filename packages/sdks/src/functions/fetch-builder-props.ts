import { getBuilderSearchParams } from './get-builder-search-params/index.js';
import type { ContentVariantsPrps } from '../components/content-variants/content-variants.types.js';
import type { Dictionary } from '../types/typescript.js';
import { fetchOneEntry } from './get-content/index.js';
import type { GetContentOptions } from './get-content/types.js';

type GetBuilderPropsOptions = (Omit<GetContentOptions, 'model'> & {
  model?: string;
}) &
  (
    | {
        /**
         * The current URL path. Used to determine the `urlPath` for targeting content.
         *
         * Cannot be used with `url`.
         */
        path: string;

        /**
         * The current URL search params. Used to parse the `searchParams` for targeting content.
         *
         * Cannot be used with `url`.
         */
        searchParams?: URLSearchParams | Dictionary<string | string[]>;
        url?: undefined;
      }
    | {
        /**
         * The current URL. Used to determine the `urlPath` for targeting content and
         * to parse the `searchParams` for targeting content.
         *
         * Cannot be used with `path` or `searchParams`.
         */
        url: URL;
        path?: undefined;
        searchParams?: undefined;
      }
    | {
        url?: undefined;
        path?: undefined;
        searchParams?: undefined;
      }
  );

/**
 * Fetches builder content, and returns it along with sensible defaults for other props that `Content` needs to render.
 */
export const fetchBuilderProps = async (
  _args: GetBuilderPropsOptions
): Promise<ContentVariantsPrps> => {
  const urlPath =
    _args.path || _args.url?.pathname || _args.userAttributes?.urlPath;

  const getContentArgs: GetContentOptions = {
    ..._args,
    apiKey: _args.apiKey,
    model: _args.model || 'page',
    userAttributes: {
      ..._args.userAttributes,
      ...(urlPath ? { urlPath } : {}),
    },
    options: getBuilderSearchParams(
      _args.searchParams || _args.url?.searchParams || _args.options
    ),
  };

  return {
    apiKey: getContentArgs.apiKey,
    model: getContentArgs.model,
    content: await fetchOneEntry(getContentArgs),
  };
};
