import React from 'react'
import {
  builder,
  Subscription,
  GetContentOptions,
  Builder
} from '@builder.io/sdk'
import { NoWrap } from './no-wrap'
import { applyPatchWithMinimalMutationChain } from '../functions/apply-patch-with-mutation'
import { VariantsProvider } from './variants-provider.component'

export interface BuilderContentProps<ContentType> {
  contentLoaded?: (content: any) => void
  contentError?: (error: any) => void
  modelName: string
  options?: GetContentOptions
  children: (
    content: ContentType,
    loading?: boolean,
    fullData?: any
  ) => React.ReactNode
  inline?: boolean
  dataOnly?: boolean
  builder?: Builder
  isStatic?: boolean
}

export class BuilderContent<
  ContentType extends object = any
> extends React.Component<BuilderContentProps<ContentType>> {
  ref: HTMLDivElement | null = null

  get builder() {
    return this.props.builder || builder
  }

  get data() {
    const { data } = this.state

    return (
      ((this.props.inline || !Builder.isBrowser || this.firstLoad) &&
        this.props.options &&
        this.props.options.initialContent &&
        this.props.options.initialContent[0]) ||
      data
    )
  }

  state = {
    loading: true,
    data: null as any,
    updates: 1
  }

  onWindowMessage = (event: MessageEvent) => {
    const message = event.data
    if (!message) {
      return
    }
    switch (message.type) {
      case 'builder.patchUpdates': {
        const { data } = message
        if (!(data && data.data)) {
          break
        }
        const patches = data.data[this.state.data?.id]
        if (!(patches && patches.length)) {
          return
        }

        if (location.href.includes('builder.debug=true')) {
          eval('debugger')
        }
        for (const patch of patches) {
          applyPatchWithMinimalMutationChain(this.state.data, patch)
        }
        this.setState({
          updates: this.state.updates + 1,
          data: this.state.data ? { ...this.state.data } : this.state.data
        })
        if (this.props.contentLoaded) {
          this.props.contentLoaded(this.state.data.data)
        }

        break
      }
    }
  }

  subscriptions = new Subscription()

  firstLoad = true
  clicked = false
  trackedImpression = false

  intersectionObserver: IntersectionObserver | null = null

  // TODO: observe model name for changes
  componentDidMount() {
    // Temporary to test metrics diving in with bigquery and heatmaps
    // this.builder.autoTrack = true;
    // this.builder.env = 'development';
    if (!this.props.inline || Builder.isEditing) {
      this.subscribeToContent()
    } else if (
      this.props.inline &&
      this.props.options?.initialContent?.length
    ) {
      const contentData = this.props.options.initialContent[0]
      this.builder.trackImpression(contentData.id, contentData.variationId)
    }

    if (Builder.isEditing) {
      addEventListener('message', this.onWindowMessage)
    }

    /// REACT15ONLY if (this.ref) { this.ref.setAttribute('builder-model', this.props.modelName); }
  }

  subscribeToContent() {
    if (this.props.modelName !== '_inline') {
      // TODO:... using targeting...? express.request hmmm
      this.subscriptions.add(
        builder
          .queueGetContent(this.props.modelName, this.props.options)
          .subscribe(
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
                            if (
                              entry.intersectionRatio > 0 &&
                              !this.trackedImpression
                            ) {
                              this.builder.trackImpression(
                                match.id!,
                                (match as any).variationId
                              )
                              this.trackedImpression = true
                              if (this.ref) {
                                observer.unobserve(this.ref)
                              }
                            }
                          })
                        }
                      ))

                      observer.observe(this.ref)
                      addedObserver = true
                    } catch (err) {
                      console.warn('Could not bind intersection observer')
                    }
                  }
                  if (!addedObserver) {
                    this.trackedImpression = true
                    this.builder.trackImpression(
                      match.id!,
                      (match as any).variationId
                    )
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
    if (Builder.isEditing) {
      removeEventListener('message', this.onWindowMessage)
    }

    this.subscriptions.unsubscribe()
    if (this.intersectionObserver && this.ref) {
      this.intersectionObserver.unobserve(this.ref)
    }
  }

  onClick = (reactEvent: React.MouseEvent<HTMLElement>) => {
    // TODO: viewport scrolling tracking for impression events
    const event = reactEvent.nativeEvent

    const content = this.data
    if (!content) {
      return
    }
    if (builder.autoTrack) {
      this.builder.trackInteraction(
        content.id,
        content.variationId,
        this.clicked,
        event
      )
    }
    if (!this.clicked) {
      this.clicked = true
    }
  }

  render() {
    if (this.props.dataOnly) {
      return null
    }
    const { loading } = this.state

    const useData = this.data
    const TagName = this.props.dataOnly ? NoWrap : 'div'

    return (
      <VariantsProvider isStatic={this.props.isStatic} initialContent={useData}>
        {variations => {
          return (
            <React.Fragment>
              {variations.map((content, index) => {
                // default Variation is at index 0, wrap the rest with template
                // TODO: IE11 don't support templates
                const Tag = index === 0 ? React.Fragment : 'template'
                return (
                  <Tag
                    key={String(content?.id! + index)}
                    data-template-variation-id={content?.id}
                  >
                    <TagName
                      {...(index === 0 &&
                        !this.props.dataOnly && {
                          ref: (ref: any) => (this.ref = ref)
                        })}
                      className="builder-content"
                      onClick={this.onClick}
                      builder-content-id={content?.id}
                      builder-model={this.props.modelName}
                    >
                      {this.props.children(
                        // whhat's going on
                        content?.data! as any,
                        this.props.inline ? false : loading,
                        useData
                      )}
                    </TagName>
                  </Tag>
                )
              })}
            </React.Fragment>
          )
        }}
      </VariantsProvider>
    )
  }
}
