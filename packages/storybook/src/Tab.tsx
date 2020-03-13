import React from 'react';
import { useStorybookState } from '@storybook/api';
import { builderBlockFromConfig } from './util';

const style = {
  display: 'block',
  height: 'calc(100vh - 39px)',
  width: '100%',
};

interface TabEditorOptions {
  api: any;
  storybookState: any;
}

class TabEditor extends React.Component<TabEditorOptions> {
  editor: any;
  blocks: any;

  get storyId() {
    return this.props.storybookState.storyId;
  }

  get currentParameter() {
    return this.props.storybookState.storiesHash[this.storyId]?.parameters?.builder?.config;
  }

  get isDev() {
    return this.props.storybookState.storiesHash[this.storyId]?.parameters?.builder?.isDev;
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
      knobsMode: Boolean(this.currentParameter),
      previewUrl: `${location.href.split('?')[0]}iframe.html?id=${this.storyId}`,
    });

    const props = {
      style,
      options,
      env: this.isDev ? 'dev' : '',
    };

    return <builder-editor {...props} />;
  }
}

const withState = (Component: typeof TabEditor) => {
  return function WrappedComponent(props: Omit<TabEditorOptions, 'storybookState'>) {
    const storybookState = useStorybookState();
    return <Component {...props} storybookState={storybookState} />;
  };
};

export default withState(TabEditor);
