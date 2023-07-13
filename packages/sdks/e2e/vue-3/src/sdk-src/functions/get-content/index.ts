import { TARGET } from '../../constants/target.js';
import { handleABTesting } from '../../helpers/ab-tests.js';
import { getDefaultCanTrack } from '../../helpers/canTrack.js';
import { logger } from '../../helpers/logger.js';
import type { BuilderContent } from '../../types/builder-content.js';
import { fetch } from '../get-fetch.js';
import { isBrowser } from '../is-browser.js';
import { generateContentUrl } from './generate-content-url.js';
import type { GetContentOptions } from './types.js';

const checkContentHasResults = (
  content: ContentResponse
): content is ContentResults => 'results' in content;

export async function getContent(
  options: GetContentOptions
): Promise<BuilderContent | null> {
  const allContent = await getAllContent({ ...options, limit: 1 });
  if (allContent && checkContentHasResults(allContent)) {
    return allContent.results[0] || null;
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

const fetchContent = async (options: GetContentOptions) => {
  const url = generateContentUrl(options);

  const res = await fetch(url.href);
  const content = await (res.json() as Promise<ContentResponse>);
  return content;
};

/**
 * Exported only for testing purposes. Should not be used directly.
 */
export const processContentResult = async (
  options: GetContentOptions,
  content: ContentResults
) => {
  const canTrack = getDefaultCanTrack(options.canTrack);

  if (!canTrack) return content;
  if (!(isBrowser() || TARGET === 'reactNative')) return content;

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

  return content;
};

export async function getAllContent(
  options: GetContentOptions
): Promise<ContentResponse | null> {
  try {
    const url = generateContentUrl(options);
    const content = await fetchContent(options);

    if (!checkContentHasResults(content)) {
      logger.error('Error fetching data. ', { url, content, options });
      return content;
    }

    return processContentResult(options, content);
  } catch (error) {
    logger.error('Error fetching data. ', error);
    return null;
  }
}
