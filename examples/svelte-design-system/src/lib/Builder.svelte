<script context="module" lang="ts">
	export const prerender = false;
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import { variables } from '$lib/variables';
	import CustomComponents from '../components'

	import * as BuilderSDK from '@builder.io/sdk-svelte';

	const CUSTOM_COMPONENTS = [
		...CustomComponents,
	];

	let content: any = undefined;
	let canShowContent = false;
	const fetch = async () => {
		content = await BuilderSDK.fetchOneEntry({
			model: 'page',
			apiKey: variables.builderKey,
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
	<BuilderSDK.Content
		model="page"
		{content}
		apiKey={variables.builderKey}
		customComponents={CUSTOM_COMPONENTS}
	/>
{/if}

<style>
  h2 {
    text-align: center;
  }
</style>