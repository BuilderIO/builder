<script lang="ts">
  import type { BuilderContent } from '@builder.io/sdk-svelte';
  import NavBar from './NavBar.svelte';
  interface Props {
    data: { links: BuilderContent | null };
  }

  let { data }: Props = $props();
</script>

<nav>
  <h1>Acme company</h1>
  <!-- NavBar component with links from Builder.io -->
  {#if data.links}
    <NavBar links={data.links} />
  {/if}
  <!-- Auth buttons -->
  <div class="auth-buttons">
    <button>Login</button>
    <button>Register</button>
  </div>
</nav>
