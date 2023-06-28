import { TARGET } from '../../constants/target.js';
import { handleABTesting } from '../../helpers/ab-tests.js';
import { getDefaultCanTrack } from '../../helpers/canTrack.js';
import { logger } from '../../helpers/logger.js';
import type { BuilderContent } from '../../types/builder-content.js';
import { fetch } from '../get-fetch.js';
import { isBrowser } from '../is-browser.js';
import { generateContentUrl } from './generate-content-url.js';
import type { FetchContent, FetchContentSuccess, FetchResults, GetContentOptions } from './types.js';

export async function fetchContent(
  options: GetContentOptions
): Promise<FetchContent> {
  const allContent = await fetchAllContent({ ...options, limit: 1 });
  if (allContent.ok) {
    return allContent.results[0];
  }
  return {
    ok: false,
    reason: allContent.reason,
    apiKey: options.apiKey,
    model: options.model,
    content: null,
  };
}

export async function fetchAllContent(
  options: GetContentOptions
): Promise<FetchResults> {
  try {
    const url = generateContentUrl(options);
    const content = await internalFetchContent(options);

    if (!checkContentHasResults(content)) {
      logger.error('Error fetching data. ', { url, content, options });
      return {
        ok: false,
        status: content.status,
        reason: content.message,
      }
    }

    return _processContentResult(options, content);
  } catch (error) {
    logger.error('Error fetching data. ', error);
    return {
      ok: false,
      status: 0,
      reason: `Error fetching data. ${error}`,
    }
  }
}

const checkContentHasResults = (
  content: ContentResponse
): content is ContentResults => 'results' in content;


type ContentResults = {
  results: BuilderContent[];
};

type ContentResponse =
  | ContentResults
  | {
      status: number;
      message: string;
    };

const internalFetchContent = async (options: GetContentOptions) => {
  const url = generateContentUrl(options);

  const res = await fetch(url.href);
  const content = await (res.json() as Promise<ContentResponse>);
  return content;
};

/**
 * Exported only for testing purposes. Should not be used directly.
 * @internal
 */
export const _processContentResult = async (
  options: GetContentOptions,
  content: ContentResults
): Promise<FetchResults> => {
  const canTrack = getDefaultCanTrack(options.canTrack);

  if (!canTrack) return wrapContents(content, options);
  if (!(isBrowser() || TARGET === 'reactNative')) return wrapContents(content, options);

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

  return wrapContents(content, options);
};
const wrapContents = (content: ContentResults, options: GetContentOptions): FetchResults  => {
  return {
    ok: true,
    results: content.results.map((item) => wrapContent(item, options))
  };
};

const wrapContent = (content: BuilderContent, options: GetContentOptions): FetchContentSuccess => {
  return {
    ok: true,
    apiKey: options.apiKey,
    model: options.model,
    content,
  };
};


/**
 * @deprecated use `fetchContent` instead
 */
export async function getContent(
  options: GetContentOptions
): Promise<BuilderContent | null> {
  const content = await fetchContent(options);
  if (content.ok) {
    return content.content;
  }
  return null;
}


/**
 * @deprecated use `fetchAllContent` instead
 */
export async function getAllContent(
  options: GetContentOptions
): Promise<ContentResponse | null> {
  const allContent = await fetchAllContent(options);
  if (allContent.ok) {
    return {
      results: allContent.results.map((item) => item.content)
    };
  }
  if (allContent.status === 0) {
    return null;
  }
  return {
    status: allContent.status,
    message: allContent.reason,
  }
}