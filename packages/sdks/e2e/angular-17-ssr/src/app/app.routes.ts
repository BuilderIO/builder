import type { Routes } from '@angular/router';
import { CatchAllComponent } from './catch-all.component';

export const routes: Routes = [
  {
    path: '**',
    component: CatchAllComponent,
  },
];
