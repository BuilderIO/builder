# Builder Angular SDK


## Integration

See our full [getting started docs](https://www.builder.io/c/docs/developers), or jump right into integration. We generally recommend to start with page buliding as your initial integration:

<table>
  <tr>
    <td align="center">Integrate Page Building</td>
    <td align="center">Integrate Section Building</td>
    <td align="center">Integrate CMS Data</td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://www.builder.io/c/docs/integrating-builder-pages?codeFramework=angular">
        <img alt="CTA to integrate page buliding" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F48bbb0ef5efb4d19a95a3f09f83c98f0" />
      </a>
    </td>
    <td align="center">
      <a href="https://www.builder.io/c/docs/integrate-section-building?codeFramework=angular">
        <img alt="CTA to integrate section buliding" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F9db93cd1a29443fca7b67c1f9f458356" />
      </a>
    </td>    
    <td align="center">
      <a href="https://www.builder.io/c/docs/integrate-cms-data?codeFramework=angular">
        <img alt="CTA to integrate CMS data" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F8df098759b0a4c89b8c25edec1f3c9eb" />
      </a>
    </td>        
  </tr>
</table>

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

## Builder sections within existing pages

With section models you can use Builder.io components in/around existing pages (aka it doesn't have to control the whole page). See info on making custom models for this [here](https://www.builder.io/c/docs/guides/getting-started-with-models)

```html
<!-- The first part of your page -->
<builder-component model="announcement-bar">Loading..</builder-component>
<!-- the rest of your page -->
```

You can then use [queries](https://www.builder.io/c/docs/custom-fields) and [targeting](https://www.builder.io/c/docs/guides/targeting-and-scheduling) to customize what content loads where

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

Note that custom Angular components use [angular elements](https://angular.io/guide/elements) and render in the browser only (no server-side rendering).

If you need server-side rendering in reusable components with Builder, consider using [symbols](https://www.builder.io/c/docs/symbols)

See [here](https://builder.io/c/docs/custom-react-components#input-type-examples) for full detail on input types available.

<img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F82d416601dbe4abb995b558fb4c121c1" alt="Visual of using your Angular component in Builder">

### Editable Regions within your custom components

<img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fb486c35599034bba9ee2aaed7f92d53e" alt="Visual of adding custom editable regions within your components in Builder">

- Register inputs for each of your editable sections of type `blocks`
- Use `builder-blocks-outlet` component to render those blocks withing your component template.

```ts
@Component({
  selector: 'custom-thing',
  template: `
    <h2>Section A</h2>
    <builder-blocks-outlet
      [blocks]="sectionA"
      [builderState]="builderState"
      [builderBlock]="builderBlock"
      dataPath="component.options.sectionA"
    ></builder-blocks-outlet>
    <h2>Section B</h2>
    <builder-blocks-outlet
      [blocks]="sectionB"
      [builderState]="builderState"
      [builderBlock]="builderBlock"
      dataPath="component.options.sectionB"
    ></builder-blocks-outlet>
  `,
})
export class CustomThing implements OnChanges {
  @Input()
  name = '';

  @Input()
  builderBlock = null;

  @Input()
  builderState = null;

  @Input()
  sectionA = null;

  @Input()
  sectionB = null;
}

BuilderBlock({
  tag: 'custom-thing',
  name: 'Custom thing',
  canHaveChildren: true,
  inputs: [
    {
      name: 'name',
      type: 'string',
    },
    {
      name: 'sectionA',
      type: 'blocks',
      hideFromUI: true,
      helperText: 'This is an editable region where you can drag and drop blocks.',
      defaultValue: [
        {
          '@type': '@builder.io/sdk:Element',
          component: {
            name: 'Text',
            options: {
              text: 'Section A Editable in Builder...',
            },
          },
          responsiveStyles: {
            large: {
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              flexShrink: '0',
              boxSizing: 'border-box',
              marginTop: '20px',
              lineHeight: 'normal',
              height: 'auto',
              textAlign: 'center',
            },
          },
        },
      ],
    },
    {
      name: 'sectionB',
      type: 'blocks',
      hideFromUI: true,
      helperText: 'This is an editable region where you can drag and drop blocks.',
      defaultValue: [
        {
          '@type': '@builder.io/sdk:Element',
          component: {
            name: 'Text',
            options: {
              text: 'Section B Editable in Builder...',
            },
          },
          responsiveStyles: {
            large: {
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              flexShrink: '0',
              boxSizing: 'border-box',
              marginTop: '20px',
              lineHeight: 'normal',
              height: 'auto',
              textAlign: 'center',
            },
          },
        },
      ],
    },
  ],
})(CustomThing);
```

## Passing data and context down

You can also pass [data](https://www.builder.io/c/docs/guides/connecting-api-data) and [functions](https://www.builder.io/c/docs/react/custom-actions) down to the Builder component to use in the UIs (e.g. bind
data values to UIs e.g. for text values or iterating over lists, and actions to trigger for instance on click of a button)

All data passed down is available in Builder [actions and bindings](https://www.builder.io/c/docs/guides/custom-code) as `state.*`, for instance in the below example `state.resources`, etc will be available

```tsx
@Component({
  selector: 'app-root',
  template: '<builder-component [options]="options" [context]="context" [data]="data" model="page"></builder-component>',
})
export class AppComponent {
  options: any = {
    cacheSeconds: 1,
    data: {
      locale: 'en-US',
    },
  };

  data = {
    resources: [ { foo: 'bar'} ]
  };

  context= {
    myFunction: (text: string) => alert(text),
  }
```

You can also pass down functions, complex data like custom objects and libraries you can use `context`. Context passes all the way down (e.g. through symbols, etc). This data is not observed for changes and mutations

Context is available in [actions and bindings](https://www.builder.io/c/docs/guides/custom-code) as `context.*`, such as `context.myFunction('hello world')` in the example above

## Example projects

To see a full example integration see [here](/examples/angular) for a simple Angular + Builder.io example project,
or [here](/examples/angular-universal) for an Angular universal example
