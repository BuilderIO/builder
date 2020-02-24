# Builder Angular SDK

## Usage

Install

```
npm install @builder.io/angular
```

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
<!-- The model input can be any model of yours -->
<builder-component model="page" (load)="contentLoaded($event)" (error)="contentError($event)">
  <!-- Default content inside the tag shows while the builder content is fetching -->
  <div class="spinner"></div>
</builder-component>
```

## Custom landing pages in your code

Simply replace your 404 component with something like the below to allow creating new pages in Builder easily

```html
<!-- The model input can be any model of yours -->
<builder-component
  *ngIf="!noBuilderPageForUrl"
  model="page"
  (load)="noBuilderPageForUrl = $event ? false : true"
  (error)="noBuilderPageForUrl = true"
>
  <!-- Default content inside the tag shows while the builder content is fetching -->
  <div class="spinner"></div>
</builder-component>
<my-404-component *ngIf="noBuilderPageForUrl"> </my-404-component>
```

## Use your angular components in your Builder pages

You can drag and drop to add your angular components in the Builder editor with a simple tag like below:

```ts
import { BuilderBlock } from '@builder.io/angular';
import { Component, Input } from '@angular/core';

@BuilderBlock({
  tag: 'custom-thing',
  name: 'Custom thing',
  inputs: [
    {
      name: 'name',
      type: 'string',
    },
  ],
})
@Component({
  selector: 'custom-thing',
  template: 'Hello: {{name}}',
})
export class CustomThing {
  @Input()
  name = '';
}
```

See [here](https://builder.io/c/docs/custom-react-components) for full detail on input types available.

<img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F82d416601dbe4abb995b558fb4c121c1" alt="Visual of using your Angular component in Builder">

## Use your state or functions in your Builder pages

Use the data input for the Builder component tag to pass down data and actions to be used in the Builder editor.

See [this guide](https://builder.io/c/docs/react/custom-actions) for usage of your data and actions in
the editor UI in Builder.

```ts
@Component({
  selector: 'my-page',
  template: '<builder-component name="page" [data]="data"></builder-component>',
})
export class MyPage {
  data = {
    someStateProperty: 'foo',
    someMethod: () => /* do something */,
    myService: this.myService
  }

  constructor(public myService: MyService) {

  }
}
```
