import { Routes } from '@angular/router';

import { NotFoundComponent } from './not-found.component';

export const APP_ROUTES: Routes = [
  // add your hardocded paths first and let builder hndle the rest in NotFoundComponent
  // { path: 'info', loadChildren: () => import('./welcome/welcome.module').then(m => m.WelcomeModule) },
  { path: '**', component: NotFoundComponent },
];
