import { createRouter, createWebHistory } from 'vue-router';
import BuilderView from '../views/BuilderView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    /**
     * https://router.vuejs.org/guide/essentials/dynamic-matching.html#catch-all-404-not-found-route
     */
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: BuilderView,
    },
  ],
});

export default router;
