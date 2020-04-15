import React from 'react';
import { builder, Subscription, GetContentOptions, Builder } from '@builder.io/sdk';
import { TouchableWithoutFeedback, GestureResponderEvent, View } from 'react-native';

export interface BuilderContentProps<ContentType> {
  contentLoaded?: (content: any) => void;
  contentError?: (error: any) => void;
  modelName: string;
  options?: GetContentOptions;
  children: (content: ContentType, loading?: boolean, fullData?: any) => React.ReactNode;
  inline?: boolean;
}

export class BuilderContent<ContentType extends object = any> extends React.Component<
  BuilderContentProps<ContentType>
> {
  state = {
    loading: true,
    data: null as any,
  };

  subscriptions = new Subscription();

  firstLoad = true;
  clicked = false;
  trackedImpression = false;

  // TODO: observe model name for changes
  componentDidMount() {
    // Temporary to test metrics diving in with bigquery and heatmaps
    // builder.autoTrack = true;
    // builder.env = 'development';
    this.subscribeToContent();

    ///REACT15ONLY if (this.ref) { this.ref.setAttribute('builder-model', this.props.modelName); }
  }

  subscribeToContent() {
    if (this.props.modelName !== '_inline') {
      // TODO:... using targeting...? express.request hmmm
      this.subscriptions.add(
        builder.queueGetContent(this.props.modelName, this.props.options).subscribe(
          matches => {
            const match = matches && matches[0];
            this.setState({
              data: match,
            });

            if (match && this.firstLoad) {
              // TODO: autoTrack
              if (builder.autoTrack) {
                this.trackedImpression = true;
                builder.trackImpression(match.id!, (match as any).variationId);
              }
              this.firstLoad = false;
            }
            if (this.props.contentLoaded) {
              this.props.contentLoaded(match && match.data || null);
            }
          },
          error => {
            if (this.props.contentError) {
              this.props.contentError(error);
            }
          }
        )
      );
    }
  }

  componentWillUnmount() {
    this.subscriptions.unsubscribe();
  }

  onClick = (reactEvent: GestureResponderEvent) => {
    // TODO: viewport scrolling tracking for impression events
    const event = reactEvent.nativeEvent;

    const content = this.state.data;
    if (!content) {
      return;
    }
    if (builder.autoTrack) {
      // TODO
      // builder.trackInteraction(content.id, content.variationId, this.clicked, event)
    }
    if (!this.clicked) {
      this.clicked = true;
    }
  };

  render() {
    const { data, loading } = this.state;

    // TODO: why is this server only? any time there is initial content
    // use it no?
    //
    const useData =
      ((this.props.inline || !Builder.isBrowser) &&
        this.props.options &&
        this.props.options.initialContent &&
        this.props.options.initialContent[0]) ||
      data;

    return (
      // TODO: use fragment
      // <TouchableWithoutFeedback
      <View
        // ref={ref => (this.ref = ref)}
        // onPress={this.onClick}
        builder-content-id={useData && useData.id}
        builder-model={this.props.modelName}
      >
        {this.props.children(useData && useData.data, loading, useData)}
      {/* </TouchableWithoutFeedback> */}
      </View>
    );
  }
}
