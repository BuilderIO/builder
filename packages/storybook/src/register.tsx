import React from 'react';
import { addons, types } from '@storybook/addons';
import { config } from './config';
import { Tab } from './Tab';

addons.register(config.addonId, () => {
  addons.add(`${config.addonId}/tab`, {
    type: types.TAB,
    title: config.title,
    route: route => `/builder/${route.storyId}`,
    match: match => match.viewMode === config.addonId,
    render: props => <Tab {...props} />,
    paramKey: config.addonId,
  });
});
