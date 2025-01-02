import { NgModule } from '@angular/core';
import { RouterModule, type Routes } from '@angular/router';
import { appResolver } from './app.resolver';
import { CatchAllComponent } from './catch-all.component';

const routes: Routes = [
  {
    path: '**',
    component: CatchAllComponent,
    resolve: { content: appResolver },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
