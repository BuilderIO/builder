import React from 'react'
import { builder, Subscription, GetContentOptions, Builder } from '@builder.io/sdk'
import { NoWrap } from './no-wrap'

export interface BuilderContentProps<ContentType> {
  contentLoaded?: (content: ContentType) => void
  contentError?: (error: any) => void
  modelName: string
  options?: GetContentOptions
  children: (content: ContentType, loading?: boolean, fullData?: any) => React.ReactNode
  inline?: boolean
  dataOnly?: boolean
}

export class BuilderContent<ContentType extends object = any> extends React.Component<
  BuilderContentProps<ContentType>
> {
  ref: HTMLDivElement | null = null

  state = {
    loading: true,
    data: null as any
  }

  subscriptions = new Subscription()

  firstLoad = true
  clicked = false
  trackedImpression = false

  intersectionObserver: IntersectionObserver | null = null

  // TODO: observe model name for changes
  componentDidMount() {
    // Temporary to test metrics diving in with bigquery and heatmaps
    // builder.autoTrack = true;
    // builder.env = 'development';
    this.subscribeToContent()

    ///REACT15ONLY if (this.ref) { this.ref.setAttribute('builder-model', this.props.modelName); }
  }

  subscribeToContent() {
    if (this.props.modelName !== '_inline') {
      // TODO:... using targeting...? express.request hmmm
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
                let addedObserver = false
                if (typeof IntersectionObserver === 'function' && this.ref) {
                  try {
                    const observer = (this.intersectionObserver = new IntersectionObserver(
                      (entries, observer) => {
                        entries.forEach(entry => {
                          // In view
                          if (entry.intersectionRatio > 0 && !this.trackedImpression) {
                            builder.trackImpression(match.id, match.variationId)
                            this.trackedImpression = true
                            if (this.ref) {
                              observer.unobserve(this.ref)
                            }
                          }
                        })
                      }
                    ))

                    observer.observe(this.ref!)
                    addedObserver = true
                  } catch (err) {
                    console.warn('Could not bind intersection observer')
                  }
                }
                if (!addedObserver) {
                  this.trackedImpression = true
                  builder.trackImpression(match.id, match.variationId)
                }
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
  }

  componentWillUnmount() {
    this.subscriptions.unsubscribe()
    if (this.intersectionObserver && this.ref) {
      this.intersectionObserver.unobserve(this.ref)
    }
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
    if (this.props.dataOnly) {
      return null
    }
    const { data, loading } = this.state

    // TODO: why is this server only? any time there is initial content
    // use it no?
    //
    const useData =
      ((this.props.inline || !Builder.isBrowser || this.firstLoad) &&
        (this.props.options &&
          this.props.options.initialContent &&
          this.props.options.initialContent[0])) ||
      data

    const TagName = this.props.dataOnly ? NoWrap : 'div'

    return (
      <TagName
        {...!this.props.dataOnly && {
          ref: ref => (this.ref = ref)
        }}
        className="builder-content"
        onClick={this.onClick}
        builder-content-id={useData && useData.id}
        builder-model={this.props.modelName}
      >
        {this.props.children(useData && useData.data, loading, useData)}
      </TagName>
    )
  }
}
