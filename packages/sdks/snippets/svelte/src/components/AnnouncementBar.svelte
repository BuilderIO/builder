<!-- https://www.builder.io/c/docs/integrate-section-building -->
<!-- https://www.builder.io/c/blueprints/announcement-bar -->
<!-- src/components/AnnouncementBar.svelte -->

<script lang="ts">
  import {
    Content,
    fetchOneEntry,
    type BuilderContent,
    isPreviewing,
  } from '@builder.io/sdk-svelte';

  let apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  let model = 'announcement-bar';

  let announcementBar: BuilderContent | null = $state(null);
  let canShowContent = $state(false);

  async function fetchContent() {
    announcementBar = await fetchOneEntry({
      apiKey,
      model,
      userAttributes: {
        urlPath: window.location.pathname,
      },
    });
    canShowContent = announcementBar ? true : isPreviewing();
  }

  fetchContent();
</script>

<main>
  {#if canShowContent}
    <Content content={announcementBar} {apiKey} {model} />
  {/if}

  <!-- Your content coming from your app (or also Builder) -->
  <div>The rest of your page goes here</div>
</main>
