<template>
  <nav>
    <h1>Acme company</h1>
    <!-- NavBar component with links from Builder.io -->
    <NavBar v-if="links" :links="links" />
    <!-- Auth buttons -->
    <div class="auth-buttons">
      <button>Login</button>
      <button>Register</button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchOneEntry } from '@builder.io/sdk-vue';
import type { BuilderContent } from '@builder.io/sdk-vue';
import NavBar from '@/components/NavBar.vue';

const links = ref<BuilderContent | null>(null);

onMounted(async () => {
  links.value = await fetchOneEntry({
    model: 'navigation-links',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
  });
});
</script>
