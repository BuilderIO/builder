import { Component, Input } from '@angular/core';
import { BuilderBlock } from '@builder.io/angular';

@Component({
  selector: 'custom-thing-children',
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
export class CustomThingChildren {
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
  tag: 'custom-thing-children',
  name: 'Custom thing with children',
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
})(CustomThingChildren);
