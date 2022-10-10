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

  await session?.set(
    `builderEditingContent:${body.key}`,
    JSON.stringify(body.data || null)
  );

  return {
    message: 'Done',
  };
}
