import React from 'react'
import { BuilderBlock } from '../decorators/builder-block.decorator'
import { BuilderElement } from '@builder.io/sdk'
import { Symbol } from './Symbol'
import { BuilderStoreContext } from '../store/builder-store'
import { parse } from 'url'

export interface RouterProps {
  model?: string
  handleRouting?: boolean
  builderBlock?: BuilderElement
  onRoute?: (routeEvent: RouteEvent) => void
}

export interface RouteEvent {
  /**
   * Url being routed to
   */
  url: string
  /**
   * Html anchor element the href is on that
   * caused the route
   */
  anchorNode: HTMLAnchorElement
  /**
   * Has preventDefault() been called preventing
   * builder from routing to the clicked URL
   */
  defaultPrevented: boolean
  /**
   * Prevents builder from handling routing for you to handle
   * yourself
   */
  preventDefault(): void
}

@BuilderBlock({
  // Builder:Router?
  name: 'Core:Router',
  inputs: [
    {
      // TODO: search picker
      name: 'model',
      type: 'string',
      defaultValue: 'page',
      advanced: true
    },
    {
      name: 'handleRouting',
      type: 'boolean',
      defaultValue: true,
      advanced: true
    },
    {
      name: 'onRoute',
      type: 'function',
      advanced: true
      // Subfields are function arguments - object with properties
    }
  ]
})
export class Router extends React.Component<RouterProps> {
  private get model() {
    return this.props.model || 'page'
  }

  private onClick = async (event: React.MouseEvent) => {
    if (this.props.handleRouting === false) {
      return
    }

    if (event.button !== 0 || event.ctrlKey || event.defaultPrevented) {
      // If this is a non-left click, or the user is holding ctr/cmd, or the url is absolute,
      // or if the link has a target attribute, don't route on the client and let the default
      // href property handle the navigation
      return
    }

    const hrefTarget = this.findHrefTarget(event)
    if (!hrefTarget) {
      return
    }

    // target="_blank" or target="_self" etc
    if (hrefTarget.target) {
      return
    }

    let href = hrefTarget.getAttribute('href')
    if (!href) {
      return
    }

    if (this.props.onRoute) {
      const routeEvent: RouteEvent = {
        url: href,
        anchorNode: hrefTarget,
        preventDefault() {
          this.defaultPrevented = true
        },
        defaultPrevented: false
      }

      this.props.onRoute(routeEvent)

      if (routeEvent.defaultPrevented) {
        event.preventDefault()
        return
      }
    }

    if (event.metaKey) {
      return
    }

    if (!this.isRelative(href)) {
      const converted = this.convertToRelative(href)
      if (converted) {
        href = converted
      } else {
        return
      }
    }

    // Otherwise if this url is relative, navigate on the client
    event.preventDefault()

    if (window.history && window.history.pushState) {
      history.pushState(null, '', href)
      if (this.privateState) {
        // Reload path info
        this.privateState.update(obj => obj)
      }
    } else {
      location.href = href
    }
  }

  render() {
    const { model } = this
    return (
      <BuilderStoreContext.Consumer>
        {state => {
          this.privateState = state
          return (
            <div onClick={this.onClick} className="builder-router" data-model={model}>
              {/* TODO: loading icon on route */}
              {/* TODO: default site styles */}
              <style>{`
                @keyframes builderLoadingSpinner {
                  0% {
                    transform: rotate(0deg);
                  }
                  100% {
                    transform: rotate(360deg);
                  }
                }
                /* TODO: overridable tag */
                .builder-loading {
                  -webkit-animation: builderLoadingSpinner 1s infinite linear;
                  animation: builderLoadingSpinner 1s infinite linear;
                  -webkit-transform: translateZ(0);
                  transform: translateZ(0);
                  border-radius: 50%;
                  width: 36px;
                  height: 36px;
                  margin: 6px auto;
                  position: relative;
                  border: 1px solid transparent;
                  border-left: 1px solid #808284;
                }
              `}</style>
              <Symbol
                // TODO: include query?
                key={state && state.location && (state.location.pathname + state.location.search)}
                symbol={{
                  model
                }}
              >
                {/* TODO: builder blocks option for loading stuff */}
                {/* TODO: input for builder blocks for this */}
                {this.props.children || (
                  <div style={{ display: 'flex' }}>
                    <div style={{ margin: '40vh auto' }} className="builder-loading" />
                  </div>
                )}
              </Symbol>
            </div>
          )
        }}
      </BuilderStoreContext.Consumer>
    )
  }

  private findHrefTarget(event: React.MouseEvent): HTMLAnchorElement | null {
    // TODO: move to core
    let element = event.target as HTMLElement | null

    while (element) {
      if (element instanceof HTMLAnchorElement && element.getAttribute('href')) {
        return element
      }

      if (element === event.currentTarget) {
        break
      }

      element = element.parentElement
    }

    return null
  }

  private isRelative(href: string) {
    return !href.match(/^(\/\/|https?:\/\/)/i)
  }

  private privateState: {
    state: any,
    update: (mutator: (state: any) => any) => void
  } | null = null

  private convertToRelative(href: string) {
    const currentUrl = parse(location.href)
    const hrefUrl = parse(href)

    if (currentUrl.host === hrefUrl.host) {
      const relativeUrl = hrefUrl.pathname + (hrefUrl.search ? hrefUrl.search : '')
      return relativeUrl
    }
  }
}
