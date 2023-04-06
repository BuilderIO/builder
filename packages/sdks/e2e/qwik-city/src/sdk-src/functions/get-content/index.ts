import type { BuilderContent } from '../../types/builder-content.js';
import { fetch } from '../get-fetch.js';
import { handleABTesting } from './ab-testing.js';
import { generateContentUrl } from './generate-content-url.js';
import type { GetContentOptions } from './types.js';

export async function getContent(
  options: GetContentOptions
): Promise<BuilderContent | null> {
  const allContent = await getAllContent({ ...options, limit: 1 });
  if ('results' in allContent) {
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
): Promise<ContentResponse> {
  const url = generateContentUrl(options);

  const res = await fetch(url.href);
  const content = await (res.json() as Promise<ContentResponse>);

  if ('status' in content && !('results' in content)) {
    console.error('[Builder.io]: Error fetching data. ', content, options);
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
    console.error('[Builder.io]: Could not setup A/B testing. ', e);
  }

  return content;
}
