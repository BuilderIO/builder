import React from 'react';
import { makeDecorator } from '@storybook/addons';
import { config } from './config';

export const builderDecorator = makeDecorator({
  name: 'builderDecortator',
  parameterName: config.addonId,
  wrapper: (storyFn, context, { parameters }) => {
    const isPreview = window.location.search.includes(`builder`);
    let isPreviewInStorybook = true;
    let props = {};

    try {
      isPreviewInStorybook = Boolean(window.parent.parent.origin);
    } catch {
      isPreviewInStorybook = false;
    }

    if (!isPreviewInStorybook) {
      props = { name: 'storybook' };
    }

    return <>{isPreview ? <parameters.component {...props} /> : storyFn(context)}</>;
  },
});
