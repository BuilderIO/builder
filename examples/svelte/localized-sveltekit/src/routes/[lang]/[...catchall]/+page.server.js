import { getContent, getBuilderSearchParams } from '@builder.io/sdk-svelte';
import { BUILDER_PUBLIC_API_KEY } from '../../../apiKey';

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
	// locale is always the first part;
	const [locale, ...parts] = event.url.pathname.split('/');
	const urlPath = parts.join('/') || '/';
	// fetch your Builder content
	const content = await getContent({
		model: 'page',
		apiKey: BUILDER_PUBLIC_API_KEY,
		options: getBuilderSearchParams(event.url.searchParams),
		userAttributes: {
			urlPath,
			locale,
		}
	});

	return { content, locale };
}
