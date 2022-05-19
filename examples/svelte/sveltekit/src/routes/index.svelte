<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { page } from '$app/stores';

	import * as BuilderSDK from '@builder.io/sdk-svelte';

	// TODO: enter your public API key
	const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

	let content = undefined;
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

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>
	<h1>
		<div class="welcome">
			<picture>
				<source srcset="svelte-welcome.webp" type="image/webp" />
				<img src="svelte-welcome.png" alt="Welcome" />
			</picture>
		</div>

		to your new<br />SvelteKit app
	</h1>

	<div>Hello world from your SvelteKit project. Below is Builder Content:</div>

	{#if canShowContent}
		<div>page: {(content && content.data && content.data.title) || 'Unpublished'}</div>
		<BuilderSDK.RenderContent model="page" {content} api-key={BUILDER_PUBLIC_API_KEY} />
	{/if}
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
