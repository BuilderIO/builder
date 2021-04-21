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

> NOTE: You can get `YOUR_API_KEY` from https://builder.io/account/space.

And then add the component wherever you like

```html
<!-- The model input can be any model of yours -->
<builder-component model="page" (load)="contentLoaded($event)" (error)="contentError($event)">
  <!-- Default content inside the tag shows while the builder content is fetching -->
  <div class="spinner"></div>
</builder-component>
```

Then, update your model's preview URL to enable on-site editing like in [this guide](https://www.builder.io/c/docs/guides/preview-url), and you are done!

Next, see the below info for more advanced usage, as well as [this guide](https://www.builder.io/c/docs/guides/getting-started-with-models) for creating custom models,
and [this guide](https://www.builder.io/c/docs/seo) for SEO optimizing your content (for angular use the data from the `load` output to get the custom field data)

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
  template: '<builder-component model="page" [data]="data"></builder-component>',
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

## Using custom fields

[Custom fields](https://www.builder.io/c/docs/custom-fields) are a powerful feature when using [custom models](https://www.builder.io/c/docs/guides/getting-started-with-models), for all sorts of customization, such as [SEO optimization](https://www.builder.io/c/docs/seo) of your content

```html
<builder-component model="page" (load)="contentLoaded($event)">
  <!-- Default content inside the tag shows while the builder content is fetching -->
  <div class="spinner"></div>
</builder-component>
```

```ts
contentLoaded(data) {
  // Data object (via the output $event) includes your custom fields, e.g. if you have a custom field named
  // "title"
  document.title = data.data.title
}
```

## Builder components within existing pages

With component models you can also use Builder.io components in/around existing pages (aka it doesn't have to control the whole page). See info on making custom models for this [here](https://www.builder.io/c/docs/guides/getting-started-with-models)

```html
<!-- The first part of your page -->
<builder-component model="my-section">Loading..</builder-component>
<!-- the rest of your page -->
```

You can then use [queries](https://www.builder.io/c/docs/custom-fields) and [targeting](https://www.builder.io/c/docs/guides/targeting-and-scheduling) to customize what content loads where

## Example projects

To see a full example integration see [here](/examples/angular) for a simple Angular + Builder.io example project,
or [here](/examples/angular-universal) for an Angular universal example
