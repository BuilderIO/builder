import { Component } from '@angular/core';
import type { RegisteredComponent } from '@builder.io/sdk-angular';

@Component({
  selector: 'app-custom-hero',
  standalone: true,
  imports: [],
  template: ` <div>This is text from your component</div> `,
})
export class CustomHeroComponent {}

export const customHeroInfo: RegisteredComponent = {
  component: CustomHeroComponent,
  name: 'CustomHero',
  canHaveChildren: true,
  defaultChildren: [
    {
      '@type': '@builder.io/sdk:Element',
      component: {
        name: 'Text',
        options: {
          text: 'This is Builder text',
        },
      },
    },
  ],
};
