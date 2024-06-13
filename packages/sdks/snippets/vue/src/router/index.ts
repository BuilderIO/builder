import AnnouncementBar from '@/views/AnnouncementBar.vue';
import QuickStart from '@/views/QuickStart.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // will match /announcements/:id or /announcements
    { path: '/announcements/:id?', component: AnnouncementBar },
    // will match everything and put it under `route.params.pathMatch`
    { path: '/:pathMatch(.*)*', component: QuickStart },
  ],
});

export default router;
