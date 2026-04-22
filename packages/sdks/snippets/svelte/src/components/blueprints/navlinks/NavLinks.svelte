<script lang="ts">
  import { onMount } from 'svelte';
  import NavBar from './NavBar.svelte';
  import { fetchOneEntry } from '@builder.io/sdk-svelte';
  import type { BuilderContent } from '@builder.io/sdk-svelte';

  let links: BuilderContent | null = null;

  onMount(() => {
    fetchOneEntry({
      model: 'navigation-links',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    }).then((res) => {
      links = res;
    });
  });
</script>

<nav>
  <h1>Acme company</h1>
  <!-- NavBar component with links from Builder.io -->
  {#if links}
    <NavBar {links} />
  {/if}
  <!-- Auth buttons -->
  <div class="auth-buttons">
    <button>Login</button>
    <button>Register</button>
  </div>
</nav>
