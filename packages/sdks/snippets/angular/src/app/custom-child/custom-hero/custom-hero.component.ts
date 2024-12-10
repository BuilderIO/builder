import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Content } from '@builder.io/sdk-angular';
import type { RegisteredComponent } from '@builder.io/sdk-angular/lib/node/context/types';

@Component({
  selector: 'app-custom-hero',
  standalone: true,
  imports: [Content, CommonModule],
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
