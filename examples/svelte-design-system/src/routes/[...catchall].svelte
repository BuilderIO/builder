<script context="module" lang="ts">
	export const prerender = false;
</script>

<script lang="ts">
	import Builder from '$lib/Builder.svelte';
</script>

<div>
	<Builder />
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
		flex: 1;
	}
</style>
