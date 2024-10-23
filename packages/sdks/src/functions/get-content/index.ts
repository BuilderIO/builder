import { TARGET } from '../../constants/target.js';
import { handleABTesting } from '../../helpers/ab-tests.js';
import { getDefaultCanTrack } from '../../helpers/canTrack.js';
import { logger } from '../../helpers/logger.js';
import { getPreviewContent } from '../../helpers/preview-lru-cache/get.js';
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
  const res = await _fetch(url.href, options.fetchOptions);

  const content = await (res.json() as Promise<ContentResponse>);
  return content;
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
  try {
    const url = generateContentUrl(options);
    const content = await _fetchContent(options);

    if (!checkContentHasResults(content)) {
      logger.error('Error fetching data. ', { url, content, options });
      return null;
    }

    return _processContentResult(options, content);
  } catch (error) {
    logger.error('Error fetching data. ', error);
    return null;
  }
}
