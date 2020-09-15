import { addParameters, addDecorator } from '@storybook/react';
import { BuilderComponent } from '@builder.io/react';
import { builderDecorator } from '@builder.io/storybook';
import '../src/builder-settings';

addDecorator(builderDecorator);

addParameters({
  builder: {
    component: BuilderComponent,
    navigateOnDblClick: true,
  },
});
