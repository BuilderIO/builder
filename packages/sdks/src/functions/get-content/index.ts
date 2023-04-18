import { handleABTesting } from '../../helpers/ab-tests.js';
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

export async function getAllContent(
  options: GetContentOptions
): Promise<ContentResponse | null> {
  try {
    const url = generateContentUrl(options);

    const res = await fetch(url.href);
    const content = await (res.json() as Promise<ContentResponse>);

    if (!checkContentHasResults(content)) {
      logger.error('Error fetching data. ', content, options);
      return content;
    }

    const canTrack = options.canTrack !== false;
    try {
      if (
        isBrowser() &&
        canTrack &&
        // This makes sure we have a non-error response with the results array.
        Array.isArray(content.results)
      ) {
        for (const item of content.results) {
          await handleABTesting({ item, canTrack });
        }
      }
    } catch (e) {
      logger.error('Could not setup A/B testing. ', e);
    }

    return content;
  } catch (error) {
    logger.error('Error fetching data. ', error);
    return null;
  }
}
