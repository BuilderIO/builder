<!-- Quickstart snippet -->
<!-- snippets/svelte/src/App.svelte -->

<script lang="ts">
  import { Router, Route } from 'svelte-routing';
  import CatchAll from './components/CatchAll.svelte';
  import AnnouncementBar from './components/AnnouncementBar.svelte';
  import LivePreview from './components/LivePreview.svelte';
  import CustomChild from './components/custom-child/CustomChild.svelte';
  import EditableRegions from './components/editable-regions/EditableRegions.svelte';
  import AdvancedChild from './components/advanced-child/AdvancedChild.svelte';
  import ProductDetails from './components/blueprints/ProductDetails.svelte';
  import ProductEditorial from './components/blueprints/product-editorial/ProductEditorial.svelte';
  export let url = '';
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<Router {url}>
  <Route path="/announcements/:id" component={AnnouncementBar} />
  <Route path="/live-preview" component={LivePreview} />
  <Route path="/custom-child" component={CustomChild} />
  <Route path="/editable-region" component={EditableRegions} />
  <Route path="/advanced-child" component={AdvancedChild} />
  <Route path="/product/category/:handle" component={ProductDetails} />
  <Route path="/products/:handle" component={ProductEditorial} />
  <Route path="/*" component={CatchAll} />
</Router>
