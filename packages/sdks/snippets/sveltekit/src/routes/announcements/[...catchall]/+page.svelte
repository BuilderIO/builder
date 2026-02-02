<!-- https://www.builder.io/c/docs/integrate-section-building -->
<!-- https://www.builder.io/c/blueprints/announcement-bar -->
<!-- src/routes/announcements/[...catchall]/+page.svelte -->

<script lang="ts">
  import { isPreviewing, Content } from '@builder.io/sdk-svelte';

  const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  const model = 'announcement-bar';

  let { data } = $props();

  const canShowContent = data.content || isPreviewing(data.searchParams);
</script>

<main>
  {#if canShowContent}
    <!-- Your Announcement Bar section -->
    <Content {model} content={data.content} {apiKey} />
  {/if}
  <!-- <NavBar/> -->
  <!-- <OtherRestOfYourPage/> -->
  <div>The rest of your page goes here</div>
</main>
