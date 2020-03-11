import React from 'react';
import { makeDecorator } from '@storybook/addons';
import { config } from './config';

export const builderDecorator = makeDecorator({
  name: 'builderDecortator',
  parameterName: config.addonId,
  wrapper: (storyFn, context, { parameters }) => {
    const isPreview = window.location.search.includes(`builder`);
    return <>{isPreview ? <parameters.component /> : storyFn(context)}</>;
  },
});
