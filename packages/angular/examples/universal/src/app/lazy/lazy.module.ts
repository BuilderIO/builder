import {NgModule, Component} from '@angular/core';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-lazy-view',
  template: `
    <h3>This is content from a lazy-loaded route</h3>
    <div>Check your Networks tab to see that the js file got loaded</div>
    <br>
    <div><em>/lazy/nested/</em> routes to the same page</div>
  `
})
export class LazyComponent {}

@NgModule({
  declarations: [LazyComponent],
  imports: [
    RouterModule.forChild([
      { path: '', component: LazyComponent, pathMatch: 'full'}
    ])
  ]
})
export class LazyModule {

}
