<script setup lang="ts">
  import { useAsyncData } from '#app';
  import NavBar from '@/components/NavBar.vue';
  import { fetchOneEntry } from '@builder.io/sdk-vue';
  
  const { data: links } = useAsyncData('nav-links', () =>
     fetchOneEntry({
      model: 'navigation-links',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b'
    })
  );
</script>

<template>
    <nav>
      <h1>Acme company</h1>
      <!-- NavBar component with links from Builder.io -->
      <NavBar :links="links" />
      <!-- Auth buttons -->
      <div class="auth-buttons">
        <button>Login</button>
        <button>Register</button>
      </div>
    </nav>
  </template>

  