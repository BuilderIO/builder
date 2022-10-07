import type {HydrogenApiRouteOptions, HydrogenRequest} from '@shopify/hydrogen';

// TODO: move to be per session (session memory)
export const builderEditingContentCache: {[key: string]: any} = {};

export async function api(request: HydrogenRequest) {
  const body = await request.json();
  builderEditingContentCache[body.key] = body.data;

  return {
    message: 'Done',
  };
}
