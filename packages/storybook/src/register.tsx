import React from 'react';
import { addons, types } from '@storybook/addons';
import { config } from './config';
import Tab from './Tab';

addons.register(config.addonId, (api) => {
  const script = document.getElementById(config.addonId);
  if (!script) {
    const builderScript = document.createElement('script');
    builderScript.src = 'https://cdn.builder.io/js/editor';
    builderScript.id = config.addonId;
    document.body.appendChild(builderScript);
  }

  addons.add(`${config.addonId}/tab`, {
    type: types.TAB,
    title: config.title,
    route: (route) => `/builder/${route.storyId}`,
    match: (match) => match.viewMode === config.addonId,
    render: ({ active, key }) => (
      <div hidden={!active} style={{ transform: 'translateX(0px)' }} key={key}>
        <Tab api={api} />
      </div>
    ),
    paramKey: config.addonId,
  });
});
