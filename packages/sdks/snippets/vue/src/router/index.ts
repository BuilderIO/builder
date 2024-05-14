import Quickstart from '@/views/Quickstart.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // will match everything and put it under `route.params.pathMatch`
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: Quickstart },
    {
      path: '/',
      name: 'home',
      component: Quickstart,
    },
  ],
});

export default router;
