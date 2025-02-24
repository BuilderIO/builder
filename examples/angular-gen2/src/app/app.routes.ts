import type { Routes } from '@angular/router';
import { CatchAllComponent } from '../../../../packages/sdks/e2e/angular-19-ssr/src/app/catch-all.component';

export const routes: Routes = [
  {
    path: '**',
    component: CatchAllComponent,
  },
];
