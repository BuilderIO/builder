import { fetchOneEntry, getBuilderSearchParams } from '@builder.io/sdk-svelte';
import { BUILDER_PUBLIC_API_KEY } from '../../apiKey';

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
	// fetch your Builder content
	const content = await fetchOneEntry({
		model: 'page',
		apiKey: BUILDER_PUBLIC_API_KEY,
		options: getBuilderSearchParams(event.url.searchParams),
		userAttributes: {
			urlPath: event.url.pathname || '/'
		}
	});

	return { content };
}
