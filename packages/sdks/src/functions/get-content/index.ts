import type { BuilderContent } from '../../types/builder-content.js';
import { fetch } from '../get-fetch.js';
import { handleABTesting } from './ab-testing.js';
import { generateContentUrl } from './generate-content-url.js';
import type { GetContentOptions } from './types.js';

export async function getContent(
  options: GetContentOptions
): Promise<BuilderContent | null> {
  return (await getAllContent({ ...options, limit: 1 })).results[0] || null;
}

/**
 * TO-DO: Handle error responses.
 */
interface ContentResponse {
  results: BuilderContent[];
}

export async function getAllContent(
  options: GetContentOptions
): Promise<ContentResponse> {
  const url = generateContentUrl(options);

  const res = await fetch(url.href);
  const content = await (res.json() as Promise<ContentResponse>);

  const canTrack = options.canTrack !== false;
  if (
    canTrack &&
    // This makes sure we have a non-error response with the results array.
    Array.isArray(content.results)
  ) {
    for (const item of content.results) {
      await handleABTesting({ item, canTrack });
    }
  }

  return content;
}
