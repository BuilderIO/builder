<!-- https://www.builder.io/c/docs/integrate-section-building -->
<!-- https://www.builder.io/c/blueprints/announcement-bar -->
<!-- src/routes/announcements/[...catchall]/+page.svelte -->

<script>
import { isPreviewing, Content } from "@builder.io/sdk-svelte";

export let data;

const canShowContent = data.content || isPreviewing();
</script>

<main>
    <h1>Welcome to SvelteKit</h1>
    <h2>Below is your Builder Content:</h2>
    {#if canShowContent}
        <div>page Title: {data.content?.data?.title || "Unpublished"}</div>
        <Content model="announcement-bar" content={data.content} apiKey={'ee9f13b4981e489a9a1209887695ef2b'} />
    {:else}
        <div>Announcement Bar not Found</div>
    {/if}
    <!-- Your content coming from your app (or also Builder) -->
    <div>The rest of your page goes here</div>
</main>
