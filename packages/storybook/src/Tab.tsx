import React from 'react';
import { useStorybookState, API } from '@storybook/api';
import { builderBlockFromConfig } from './util';

const style = {
  display: 'block',
  height: 'calc(100vh - 39px)',
  width: '100%',
};

interface TabEditorOptions {
  api: API;
  currentStory: any;
}

class TabEditor extends React.Component<TabEditorOptions> {
  editor: any;
  blocks: any;

  get currentParameter() {
    return this.props.currentStory.parameters?.builder?.config;
  }

  get env() {
    return this.props.currentStory.parameters?.builder?.env;
  }

  componentDidMount() {
    this.updateEditor();
  }

  componentDidUpdate() {
    this.updateEditor();
  }

  updateEditor() {
    this.editor = document.querySelector('builder-editor');
    if (this.editor && this.currentParameter) {
      this.editor.data = builderBlockFromConfig(this.currentParameter);
    }
  }

  render() {
    const options = JSON.stringify({
      storybookMode: true,
      knobsMode: true,
      previewUrl: `${location.href.split('?')[0]}iframe.html?id=${this.props.currentStory.id}`,
    });

    const props = {
      style,
      options,
      ...(this.env && { env: this.env }),
    };

    return <builder-editor {...props} />;
  }
}

const withState = (Component: typeof TabEditor) => {
  return function WrappedComponent(props: Omit<TabEditorOptions, 'currentStory'>) {
    const storybookState = useStorybookState();
    const currentStory = storybookState.storiesHash[storybookState.storyId];
    const renderTab = storybookState.storiesConfigured && currentStory;
    return renderTab ? <Component {...props} currentStory={currentStory} /> : <></>;
  };
};

export default withState(TabEditor);
