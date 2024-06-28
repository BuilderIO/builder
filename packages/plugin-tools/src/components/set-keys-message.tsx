/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

export function SetEcomKeysMessage(props: { pluginName: string; pluginId: string }) {
  return (
    <div
      css={{
        padding: 40,
        color: '#444',
        textAlign: 'center',
      }}
    >
      <div css={{ color: '#000', paddingBottom: 10 }}>
        You have not entered your {props.pluginName} keys!{' '}
      </div>
      Go to your{' '}
      <a target="_blank" href="/account/organization" css={{ color: 'steelblue' }}>
        settings
      </a>{' '}
      page, find {props.pluginId} in the list, and set your API and secret keys to use this plugin
    </div>
  );
}
