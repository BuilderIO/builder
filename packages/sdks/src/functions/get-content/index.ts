import { TARGET } from '../../constants/target.js';
import { handleABTesting } from '../../helpers/ab-tests.js';
import { getDefaultCanTrack } from '../../helpers/canTrack.js';
import { logger } from '../../helpers/logger.js';
import { getPreviewContent } from '../../helpers/preview-lru-cache/get.js';
import { getSdkHeaders } from '../../helpers/sdk-headers.js';
import type { BuilderContent } from '../../types/builder-content.js';
import { fetch } from '../get-fetch.js';
import { isBrowser } from '../is-browser.js';
import { generateContentUrl } from './generate-content-url.js';
import type { GetContentOptions } from './types.js';

const checkContentHasResults = (
  content: ContentResponse
): content is ContentResults => 'results' in content;

/**
 * Returns the first content entry that matches the given options.
 */
export async function fetchOneEntry(
  options: GetContentOptions
): Promise<BuilderContent | null> {
  const finalLocale = options.locale || options.userAttributes?.locale;

  if (finalLocale) {
    options.locale = finalLocale;
    options.userAttributes = {
      locale: finalLocale,
      ...options.userAttributes,
    };
  }

  const allContent = await fetchEntries({ ...options, limit: 1 });

  if (allContent) {
    return allContent[0] || null;
  }

  return null;
}

type ContentResults = {
  results: BuilderContent[];
};

type ContentResponse =
  | ContentResults
  | {
      status: number;
      message: string;
    };

const _fetchContent = async (options: GetContentOptions) => {
  const url = generateContentUrl(options);
  const _fetch = options.fetch ?? fetch;

  const fetchOptions = {
    ...options.fetchOptions,
    headers: {
      ...(options.fetchOptions as any)?.headers,
      ...getSdkHeaders(),
    },
  };

  try {
    const res = await _fetch(url.href, fetchOptions);

    // Check if response is OK
    if (!res.ok) {
      logger.error(`Builder.io API returned ${res.status} for ${url.href}`);
      return { results: [] } as ContentResults;
    }

    // Check if response is JSON
    const contentType = res.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      logger.error(
        `Builder.io API returned non-JSON response (${contentType}) for ${url.href}`
      );
      return { results: [] } as ContentResults;
    }

    const content = await (res.json() as Promise<ContentResponse>);
    return content;
  } catch (error) {
    logger.error('Error fetching Builder.io content:', error);
    return { results: [] } as ContentResults;
  }
};

/**
 * @internal Exported only for testing purposes. Do not use.
 */
export const _processContentResult = async (
  options: GetContentOptions,
  content: ContentResults,
  url: URL = generateContentUrl(options)
): Promise<BuilderContent[]> => {
  const canTrack = getDefaultCanTrack(options.canTrack);

  const isPreviewing = url.search.includes(`preview=`);

  if (TARGET === 'rsc' && isPreviewing) {
    const newResults: BuilderContent[] = [];
    for (const item of content.results) {
      const previewContent = getPreviewContent(url.searchParams);
      newResults.push(previewContent || item);
    }
    content.results = newResults;
  }

  if (!canTrack) return content.results;
  if (!(isBrowser() || TARGET === 'reactNative')) return content.results;

  /**
   * For client-side navigations, it is ideal to handle AB testing at this point instead of using our
   * complex multi-rendering variants approach, which is only needed for SSR'd content.
   *
   * This is also where react-native would handle AB testing.
   */
  try {
    const newResults: BuilderContent[] = [];
    for (const item of content.results) {
      newResults.push(await handleABTesting({ item, canTrack }));
    }
    content.results = newResults;
  } catch (e) {
    logger.error('Could not process A/B tests. ', e);
  }

  return content.results;
};

/**
 * Returns a paginated array of entries that match the given options.
 */
export async function fetchEntries(options: GetContentOptions) {
  const url = generateContentUrl(options);
  const content = await _fetchContent(options);

  if (!checkContentHasResults(content)) {
    logger.error('Error fetching data. ', { url, content, options });
    throw content;
  }

  return _processContentResult(options, content);
}
