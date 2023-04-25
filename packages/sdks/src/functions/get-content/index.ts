import { logger } from '../../helpers/logger.js';
import type { BuilderContent } from '../../types/builder-content.js';
import { fetch } from '../get-fetch.js';
import { handleABTesting } from './ab-testing.js';
import { generateContentUrl } from './generate-content-url.js';
import type { GetContentOptions } from './types.js';

export async function getContent(
  options: GetContentOptions
): Promise<BuilderContent | null> {
  const allContent = await getAllContent({ ...options, limit: 1 });
  if (allContent && 'results' in allContent) {
    return allContent?.results[0] || null;
  }

  return null;
}

type ContentResponse =
  | {
      results: BuilderContent[];
    }
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

    if ('status' in content && !('results' in content)) {
      logger.error('Error fetching data. ', content, options);
      return content;
    }

    const canTrack = options.canTrack !== false;
    try {
      if (
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
