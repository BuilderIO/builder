<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import Counter from '$lib/Counter.svelte';
	import { page } from '$app/stores';

	import { getContent, isEditing, isPreviewing, getBuilderSearchParams, RenderContent } from '@builder.io/sdk-svelte';

// TODO: enter your public API key
const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

	// onMounted() {
  //   // we need to re-run this check on the client in case of SSR
  //   this.canShowContent = this.content || isEditing() || isPreviewing();
  // },

let content = undefined
let canShowContent 	= false
const fetch = async () => {
    content = await getContent({
      model: 'page',
      apiKey: BUILDER_PUBLIC_API_KEY,
      options: getBuilderSearchParams($page.params),
      userAttributes: {
        urlPath: $page.url.pathname,
      },
    });
    canShowContent = content || isEditing();

    if (!this.canShowContent) {
			// 404
    }
  }

	fetch()

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

	<div v-if="canShowContent">
		<div>page: { (content && content.data && content.data.title) || 'Unpublished' }</div>
		<RenderContent model="page" content={content} api-key={BUILDER_PUBLIC_API_KEY} />
	</div>

	<!-- <h2>
		try editing <strong>src/routes/index.svelte</strong>
	</h2>

	<Counter /> -->
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
