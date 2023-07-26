import { getContent, getBuilderSearchParams } from '@builder.io/sdk-svelte';
import { BUILDER_PUBLIC_API_KEY } from '../../../apiKey';
import { getLocaleFromPathname } from '../../../utils';

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
	// const locale = getLocaleFromPathname(event.url.pathname);
	const locale = "en-US"
	// remove locale from the path to match multiple locales in same page if needed
	const urlPath = event.url.pathname.replace(`/${locale}`, '') || '/';
	// fetch your Builder content
	console.log('URL PATH', urlPath)
	const content = await getContent({
		model: 'page',
		apiKey: BUILDER_PUBLIC_API_KEY,
		locale,
		// op getBuilderSearchParams(event.url.searchParams),
		userAttributes: {
			urlPath,
			locale
		}
	});
	console.log('CONTENT: ', content)

	return { content, locale, ...(!content && { status: 404 }) };
}
