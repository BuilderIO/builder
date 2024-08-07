<!-- https://www.builder.io/c/docs/integrate-section-building -->
<!-- https://www.builder.io/c/blueprints/announcement-bar -->
<!-- src/routes/announcements/[...catchall]/+page.svelte -->

<script>
  import { isPreviewing, Content } from '@builder.io/sdk-svelte';

  const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  const model = 'announcement-bar';

  export let data;

  const canShowContent = data.announcementBar || isPreviewing();
</script>

<main>
  {#if canShowContent}
    <!-- Your Announcement bar section goes here -->
    <Content {model} content={data.announcementBar} {apiKey} />
  {/if}

  <!-- <TheRestOfYourPage/> -->
  <div>The rest of the page goes here</div>
</main>
