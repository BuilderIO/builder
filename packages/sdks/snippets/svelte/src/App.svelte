<!-- Quickstart snippet -->
<!-- snippets/svelte/src/App.svelte -->

<script lang="ts">
  import { Router, Route } from 'svelte-routing';
  import CatchAll from './components/CatchAll.svelte';
  import AnnouncementBar from './components/AnnouncementBar.svelte';
  import LivePreview from './components/LivePreview.svelte';
  export let url = '';
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<Router {url}>
  <Route path="/announcements/:id" component={AnnouncementBar} />
  <Route path="/live-preview" component={LivePreview} />
  <Route path="/*" component={CatchAll} />
</Router>
