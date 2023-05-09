import Vue from 'vue';
import VueRouter from 'vue-router';
import BuilderView from '../views/BuilderView.vue';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  base: import.meta.env.BASE_URL,
  routes: [
    // will match everything and put it under `$route.params.pathMatch`
    { path: '/:pathMatch(.*)*', name: 'BuilderContent', component: BuilderView },
  ],
});

export default router;
