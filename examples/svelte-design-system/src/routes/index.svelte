<script context="module" lang="ts">
	export const prerender = false;
</script>

<script lang="ts">
	import Builder from '$lib/Builder.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div>
	<Builder />
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
		justify-content: center;
		flex: 1;
	}
</style>
