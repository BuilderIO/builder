import { BuilderBlock } from '@builder.io/angular';
import { Component, Input } from '@angular/core';
import './with-children';

@Component({
  selector: 'custom-thing',
  template: 'Hello: {{name}}',
})
export class CustomThing {
  @Input()
  name = '';
}

BuilderBlock({
  tag: 'custom-thing',
  name: 'Custom thing',
  inputs: [
    {
      name: 'name',
      type: 'string',
    },
  ],
})(CustomThing);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'app';
  options: any = {
    cacheSeconds: 1,
    data: {
      locale: 'en-US',
    },
  };

  data = {
    property: 'hello',
    fn: (text: string) => alert(text),
  };

  load(event: any) {
    console.log('load', event);
  }

  error(event: any) {
    console.log('error', event);
  }
}
