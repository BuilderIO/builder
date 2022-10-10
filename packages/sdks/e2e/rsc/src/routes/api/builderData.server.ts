import type {
  HydrogenApiRouteOptions,
  HydrogenRequest,
} from '@shopify/hydrogen';

// TODO: move to be per session (session memory)
export const builderEditingContentCache: { [key: string]: any } = {};

export async function api(
  request: HydrogenRequest,
  { session }: HydrogenApiRouteOptions
) {
  const body = await request.json();

  // TODO: why not working
  await session?.set(
    `builderEditingContent:${body.key}`,
    JSON.stringify(body.data || null)
  );

  // TODO: remove
  builderEditingContentCache[body.key] = body.data || null;

  return {
    message: 'Done',
  };
}
