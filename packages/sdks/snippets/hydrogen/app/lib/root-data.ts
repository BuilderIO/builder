import {useMatches} from '@remix-run/react';
import type {SerializeFrom} from '@shopify/remix-oxygen';
import type {loader} from '~/root';

/**
 * Access the result of the root loader from a React component.
 */
export function useRootLoaderData() {
  const [root] = useMatches();
  return root?.data as SerializeFrom<typeof loader>;
}
