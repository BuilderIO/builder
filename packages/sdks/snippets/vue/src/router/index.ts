import AnnouncementBar from '@/views/AnnouncementBar.vue';
import CustomChild from '@/views/CustomChild.vue';
import LivePreview from '@/views/LivePreview.vue';
import QuickStart from '@/views/QuickStart.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // will match /announcements/:id or /announcements
    { path: '/announcements/:id?', component: AnnouncementBar },
    { path: '/live-preview', component: LivePreview },
    { path: '/custom-child', name: 'CustomChild', component: CustomChild },
    // will match everything and put it under `route.params.pathMatch`
    { path: '/:pathMatch(.*)*', component: QuickStart },
  ],
});

export default router;
