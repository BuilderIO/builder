import AdvancedChild from '@/views/AdvancedChild.vue';
import AnnouncementBar from '@/views/AnnouncementBar.vue';
import CustomChild from '@/views/CustomChild.vue';
import EditableRegions from '@/views/EditableRegions.vue';
import LivePreview from '@/views/LivePreview.vue';
import QuickStart from '@/views/QuickStart.vue';
import BlogArticle from '@/views/blueprints/BlogArticle.vue';
import Hero from '@/views/blueprints/Hero.vue';
import Homepage from '@/views/blueprints/Homepage.vue';
import NavLinks from '@/views/blueprints/NavLinks.vue';
import ProductDetails from '@/views/blueprints/ProductDetails.vue';
import ProductEditorial from '@/views/blueprints/ProductEditorial.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // will match /announcements/:id or /announcements
    { path: '/announcements/:id?', component: AnnouncementBar },
    { path: '/live-preview', component: LivePreview },
    { path: '/custom-child', component: CustomChild },
    {
      path: '/editable-region',
      component: EditableRegions,
    },
    {
      path: '/advanced-child',
      component: AdvancedChild,
    },
    { path: '/product/category/:handle', component: ProductDetails },
    { path: '/products/:id', component: ProductEditorial },
    { path: '/blogs/:handle', component: BlogArticle },
    { path: '/marketing-event', component: Hero },
    { path: '/home', component: Homepage },
    { path: '/landing-page', component: NavLinks },
    // will match everything and put it under `route.params.pathMatch`
    { path: '/:pathMatch(.*)*', component: QuickStart },
  ],
});

export default router;
