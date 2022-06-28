<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import CustomComponents from '../components'

	import * as BuilderSDK from '@builder.io/sdk-svelte';

	const CUSTOM_COMPONENTS = [
		...CustomComponents,
	];
	// TODO: enter your public API key
	const BUILDER_PUBLIC_API_KEY = 'bcda49ef60db482bbac8998a73a2f312';

	let content: any = undefined;
	let canShowContent = false;
	const fetch = async () => {
		content = await BuilderSDK.getContent({
			model: 'page',
			apiKey: BUILDER_PUBLIC_API_KEY,
			options: BuilderSDK.getBuilderSearchParams(
				BuilderSDK.convertSearchParamsToQueryObject($page.url.searchParams)
			),
			userAttributes: {
				urlPath: $page.url.pathname
			}
		});
		canShowContent = content || BuilderSDK.isEditing();
	};

	fetch();
</script>

<!-- TODO: IF !content return 404 page -->
<h1>Hello world from your SvelteKit project.</h1>
<h2>Below is Builder Content:</h2>

{#if canShowContent}
	<BuilderSDK.RenderContent
		model="page"
		{content}
		apiKey={BUILDER_PUBLIC_API_KEY}
		customComponents={CUSTOM_COMPONENTS}
	/>
{/if}

<style>
  h2 {
    text-align: center;
  }
</style>