import React from 'react';
import appContext from '@builder.io/app-context';
import { TrackChanges } from '@material-ui/icons';

export const trackEventId = 'track-gtag';

// TODO: doc for how to do this and how to hook into your own analytics providers too
appContext.registerAction({
  name: 'Track Event with Google Analytics',
  id: trackEventId,
  kind: 'function',
  icon: <TrackChanges />,
  inputs: () => [
    {
      name: 'name',
      type: 'text',
      friendlyName: 'Event name',
      helperText:
        'Add a unique event name, such as "addToCart", preferably with no spaces and/or symbols',
      defaultValue: 'myEvent',
    },
  ],
  toJs: options => {
    const name = options.name?.trim();
    if (!name) {
      return '';
    }
    return `
      if (typeof gtag === 'function') {
        gtag('send', {
          hitType: 'event',
          eventCategory: 'Site',
          eventAction: '${name}',
        });
      }
    `;
  },
});
