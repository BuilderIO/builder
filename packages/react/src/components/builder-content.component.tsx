import React from 'react'
import { builder, Subscription, GetContentOptions } from '@builder.io/sdk'

export interface BuilderContentProps<ContentType> {
  contentLoaded?: (content: ContentType) => void
  contentError?: (error: any) => void
  modelName: string
  options?: GetContentOptions
  children: (content: ContentType, loading?: boolean, fullData?: any) => React.ReactNode
}

export class BuilderContent<ContentType extends object = any> extends React.Component<
  BuilderContentProps<ContentType>
> {
  state = {
    loading: true,
    data: null as any
  }

  subscriptions = new Subscription()

  firstLoad = true
  clicked = false

  // TODO: observe model name for changes
  componentDidMount() {
    // Temporary to test metrics diving in with bigquery and heatmaps
    // builder.autoTrack = true;
    // builder.env = 'development';
    this.subscribeToContent()
  }

  subscribeToContent() {
    this.subscriptions.add(
      builder.queueGetContent(this.props.modelName, this.props.options).subscribe(
        matches => {
          const match = matches && matches[0]
          this.setState({
            data: match
          })

          if (match && this.firstLoad) {
            // TODO: autoTrack
            if (builder.autoTrack) {
              builder.trackImpression(match.id, match && match.variationId)
            }
            this.firstLoad = false
          }
          if (this.props.contentLoaded) {
            this.props.contentLoaded(match && match.data)
          }
        },
        error => {
          if (this.props.contentError) {
            this.props.contentError(error)
          }
        }
      )
    )
  }

  componentWillUnmount() {
    this.subscriptions.unsubscribe()
  }

  onClick = (reactEvent: React.MouseEvent<HTMLElement>) => {
    // TODO: viewport scrolling tracking for impression events
    const event = reactEvent.nativeEvent

    const content = this.state.data
    if (!content) {
      return
    }
    if (builder.autoTrack) {
      builder.trackInteraction(content.id, content.variationId, this.clicked, event)
    }
    if (!this.clicked) {
      this.clicked = true
    }
  }

  render() {
    const { data, loading } = this.state
    return (
      // TODO: tag instead?
      <div
        className="builder-content"
        onClick={this.onClick}
        builder-content-id={this.state.data && this.state.data.id}
        builder-model={this.props.modelName}
      >
        {this.props.children(data && data.data, loading, data)}
      </div>
    )
  }
}
