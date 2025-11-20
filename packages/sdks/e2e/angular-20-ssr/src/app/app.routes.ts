import type { Routes } from '@angular/router';
// import { CatchAllPage } from './catch-all-page/catch-all-page';
// import { catchAllResolver } from './catch-all-page/catch-all.resolver';
import { HomePage } from './home-page';
import { CatchAllComponent } from './catch-all.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: '**',
    component: CatchAllComponent,
    // resolve: { content: catchAllResolver },
  },
];
