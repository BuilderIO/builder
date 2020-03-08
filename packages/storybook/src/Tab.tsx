import React from 'react';
import { RenderOptions } from '@storybook/addons';
import { useStorybookState, useStorybookApi } from '@storybook/api';
import { config } from './config';
import { AddonPanel } from '@storybook/components';

const style = {
  display: 'block',
  height: '90vh',
  width: '100%',
};

export const Tab = (props: RenderOptions) => {
  const state = useStorybookState();
  const api = useStorybookApi()
  requestAnimationFrame(() => api.toggleFullscreen(props.active))
  const storyId = state.storyId;
  React.useEffect(() => {
    const script = document.getElementById(config.addonId);
    if (script) {
      return;
    }
    const builderScript = document.createElement('script');
    builderScript.src = 'https://cdn-qa.builder.io/js/editor';
    builderScript.id = config.addonId;
    document.body.appendChild(builderScript);
  });

  return (
    <AddonPanel {...props}>
      {storyId ? (
        <builder-editor
          style={style}
          options={`{
        "floatingLeftSidebar": false,
        "rtlMode": false,
        "previewUrl":"${location.href.split('?')[0]}iframe.html?id=${storyId}"
        }`}
        ></builder-editor>
      ) : (
        <span>No Builder is configured for this story</span>
      )}
    </AddonPanel>
  );
};
