import { addParameters } from '@storybook/react';
import { BuilderComponent } from '@builder.io/react';
import '../src/builder-settings';

addParameters({
  builder: {
    component: BuilderComponent
  },
});
