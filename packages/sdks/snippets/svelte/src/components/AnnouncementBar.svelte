<!-- https://www.builder.io/c/docs/integrate-section-building -->
<!-- https://www.builder.io/c/blueprints/announcement-bar -->
<!-- src/components/AnnouncementBar.svelte -->

<script lang="ts">
  import {
    Content,
    fetchOneEntry,
    type BuilderContent,
  } from '@builder.io/sdk-svelte';

  let apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  let model = 'announcement-bar';

  let announcementBar: BuilderContent | null = null;

  async function fetchContent() {
    announcementBar = await fetchOneEntry({
      apiKey,
      model,
      userAttributes: {
        urlPath: window.location.pathname,
      },
    });
  }

  fetchContent();
</script>

<main>
  {#if announcementBar}
    <Content content={announcementBar} {apiKey} {model} />
  {/if}
  
  <!-- Your content coming from your app (or also Builder) -->
  <div>The rest of your page goes here</div>
</main>
