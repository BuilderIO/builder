import React from 'react'
import { Builder, builder, GetContentOptions } from '@builder.io/sdk'

interface BuilderSimpleComponentProps {
  options?: GetContentOptions
  name: string
  entry?: string
  apiKey?: string
  onLoad?: (data: any) => void
  onError?: (error: any) => void
  html?: string
}

// TODO: docs
export class BuilderSimpleComponent extends React.Component<BuilderSimpleComponentProps> {
  state = {
    data: null as any,
    classes: [] as string[],
    loading: false,
    error: false
  }

  ref: HTMLElement | null = null

  private previousName = ''
  private subscriptions: Function[] = []
  // TODO: do this in core SDK
  private trackedClick = false

  addClass(className: string) {
    if (this.state.classes.indexOf(className) === -1) {
      this.setState({
        ...this.state,
        classes: this.state.classes.concat([className])
      })
    }
  }

  removeClass(className: string) {
    const index = this.state.classes.indexOf(className)
    if (index !== -1) {
      const newClasses = this.state.classes.slice()
      newClasses.splice(index, 1)
      this.setState({
        ...this.state,
        classes: newClasses
      })
    }
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  onClick = (event: React.MouseEvent) => {
    if (builder.canTrack) {
      const { data } = this.state
      if (data) {
        builder.trackInteraction(
          data.id,
          data.testVariationId || data.id,
          this.trackedClick,
          event.nativeEvent
        )
        if (!this.trackedClick) {
          this.trackedClick = true
        }
      }
    }
  }

  componentDidMount() {
    this.getContent()
  }

  disconnectedCallback() {
    this.unsubscribe()
  }

  componentWillUpdate(props: BuilderSimpleComponentProps) {
    if (props.name !== this.props.name || props.entry !== this.props.entry) {
      // TODO: more options too
      this.getContent()
    }
  }

  loaded() {
    this.addClass('builder-loaded')
  }

  getContent() {
    const key = this.props.apiKey
    if (key && key !== builder.apiKey) {
      builder.apiKey = key
    }

    if (!builder.apiKey) {
      const subscription = builder['apiKey$'].subscribe((key?: string) => {
        if (key) {
          this.getContent()
        }
      })
      this.subscriptions.push(() => subscription.unsubscribe())
    }

    if (this.props.html) {
      return
    }

    const name = this.props.name
    if (name === this.previousName) {
      return false
    }

    const entry = this.props.entry

    this.unsubscribe()
    if (!name) {
      return false
    }

    this.previousName = name
    this.addClass('builder-loading')
    this.setState({
      ...this.state,
      loading: true
    })
    // TODO: allow options as property or json
    const subscription = builder
      .get(name, {
        prerender: true,
        entry: entry || undefined
      })
      .subscribe(
        (data: any) => {
          this.removeClass('builder-loading')
          this.loaded()
          this.addClass('builder-no-content-found')
          if (!data) {
            if (this.props.onLoad) {
              this.props.onLoad(data)
            }
            return
          }
          if (this.ref && this.ref.classList.contains('builder-editor-injected')) {
            this.unsubscribe()
          } else {
            this.setState({
              ...this.state,
              data: data,
              loading: false
            })
            if (builder.canTrack) {
              // TODO: track unique vs not as well
              builder.trackImpression(data.id, data.testVariationId || data.id)
            }
            if (data.data && data.data.html) {
              if (this.props.onLoad) {
                this.props.onLoad(data)
              }
              if (data.data.animations && data.data.animations.length) {
                Builder.nextTick(() => {
                  Builder.animator.bindAnimations(data.data.animations)
                })
              }
            }
          }
        },
        (error: any) => {
          this.addClass('builder-errored')
          this.addClass('builder-loaded')
          this.removeClass('builder-loading')
          if (this.props.onError) {
            this.props.onError(error)
          }
          this.setState({
            ...this.state,
            loading: false,
            error: true
          })
        }
      )
    this.subscriptions.push(() => subscription.unsubscribe())
  }

  unsubscribe() {
    if (this.subscriptions) {
      this.subscriptions.forEach(fn => fn())
      this.subscriptions = []
    }
  }

  render() {
    const html =
      this.props.html ||
      (this.state && this.state.data && this.state.data.data && this.state.data.data.html)
    return (
      <div
        builder-model={this.props.name}
        ref={ref => (this.ref = ref)}
        className={this.state.classes.join(' ')}
        dangerouslySetInnerHTML={html ? { __html: html } : undefined}
      >
        {(!html && this.state.loading && this.props.children) || undefined}
      </div>
    )
  }
}
