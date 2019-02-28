# Builder Angular SDK

## Usage

Add the module

```ts
import { BuilderModule } from '@builder.io/angular';

@NgModule({
  ...
  imports: [ BuilderModule.forRoot('YOUR_API_KEY') ],
  ...
})
export class MyAppModule { }
```


And then add the component wherever you like, and you are done!
```html
<!-- Your model can be any model of yours -->
<builder-component
  model="page"
  (load)="contentLoaded($event)"
  (error)="contentError($event)">
  <!-- Default content inside the tag shows while the builder content is fetching -->
  <div
    class="loading-container">
    <div class="spinner"></div>
  </div>
</builder-component>
```
