/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { BuilderElement, builder, Builder } from '@builder.io/sdk';
import { BuilderStoreContext } from '../store/builder-store';
import { BuilderComponent } from '../components/builder-component.component';
import { withBuilder } from '../functions/with-builder';

export interface RouterProps {
  model?: string;
  data?: string;
  content?: any;
  handleRouting?: boolean;
  builderBlock?: BuilderElement;
  preloadOnHover?: boolean;
  onRoute?: (routeEvent: RouteEvent) => void;
}

const prefetched = new Set();

function searchToObject(location: Location) {
  const pairs = (location.search || '').substring(1).split('&');
  const obj: { [key: string]: string } = {};

  for (const i in pairs) {
    if (!(pairs[i] && typeof pairs[i] === 'string')) {
      continue;
    }
    const pair = pairs[i].split('=');
    obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }

  return obj;
}

export interface RouteEvent {
  /**
   * Url being routed to
   */
  url: string;
  /**
   * Html anchor element the href is on that
   * caused the route
   */
  anchorNode: HTMLAnchorElement;
  /**
   * Has preventDefault() been called preventing
   * builder from routing to the clicked URL
   */
  defaultPrevented: boolean;
  /**
   * Prevents builder from handling routing for you to handle
   * yourself
   */
  preventDefault(): void;
}

class RouterComponent extends React.Component<RouterProps> {
  builder = builder;

  routed = false;

  private preloadQueue = 0;

  // TODO: handle route to same url as current (do nothing)
  // TODO: replaceState option
  public route(url: string) {
    this.routed = true;

    // TODO: check if relative?
    if (window.history && window.history.pushState) {
      history.pushState(null, '', url);
      this.updateLocationState();
      return true;
    } else {
      location.href = url;
      return false;
    }
  }

  private updateLocationState() {
    if (this.privateState) {
      // Reload path info
      this.privateState.update(obj => {
        // TODO: force always override the location path info... hmm
        obj.location = {
          ...obj.location,
          pathname: location.pathname,
          search: location.search,
          path: location.pathname.split('/').slice(1),
          query: searchToObject(location),
        };
      });
    }
  }

  private get model() {
    return this.props.model || 'page';
  }

  componentDidMount() {
    if (typeof document !== 'undefined') {
      document.addEventListener('click', this.onClick);
      window.addEventListener('popstate', this.onPopState);
      document.addEventListener('mouseover', this.onMouseOverOrTouchStart);
      document.addEventListener('touchstart', this.onMouseOverOrTouchStart);
    }
  }

  componentWillUnmount() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.onClick);
      document.removeEventListener('mouseover', this.onMouseOverOrTouchStart);
      window.removeEventListener('popstate', this.onPopState);
      document.removeEventListener('touchstart', this.onMouseOverOrTouchStart);
    }
  }

  private onPopState = (event: Event) => {
    this.updateLocationState();
  };

  private onMouseOverOrTouchStart = (event: MouseEvent | TouchEvent) => {
    if (this.preloadQueue > 4) {
      return;
    }

    if (this.props.preloadOnHover === false) {
      return;
    }

    const hrefTarget = this.findHrefTarget(event);
    if (!hrefTarget) {
      return;
    }

    let href = hrefTarget.getAttribute('href');
    if (!href) {
      return;
    }

    // TODO: onPreload hook and preload dom event
    // Also allow that to be defaultPrevented to cancel this behavior
    if (!this.isRelative(href)) {
      const converted = this.convertToRelative(href);
      if (converted) {
        href = converted;
      } else {
        return;
      }
    }

    if (href.startsWith('#')) {
      return;
    }

    if (prefetched.has(href)) {
      return;
    }
    prefetched.add(href);

    const parsedUrl = this.parseUrl(href);

    // TODO: override location!
    this.preloadQueue++;

    // TODO: use builder from context
    const attributes = builder.getUserAttributes();
    attributes.urlPath = parsedUrl.pathname;
    attributes.queryString = parsedUrl.search;

    // Should be queue?
    const subscription = builder
      .get(this.model, {
        userAttributes: attributes,
        key: this.model + ':' + parsedUrl.pathname + parsedUrl.search,
      })
      .subscribe(() => {
        this.preloadQueue--;
        subscription.unsubscribe();
      });
  };

  private onClick = async (event: MouseEvent) => {
    if (this.props.handleRouting === false) {
      return;
    }

    if (event.button !== 0 || event.ctrlKey || event.defaultPrevented || event.metaKey) {
      // If this is a non-left click, or the user is holding ctr/cmd, or the url is absolute,
      // or if the link has a target attribute, don't route on the client and let the default
      // href property handle the navigation
      return;
    }

    const hrefTarget = this.findHrefTarget(event);
    if (!hrefTarget) {
      return;
    }

    // target="_blank" or target="_self" etc
    if (hrefTarget.target && hrefTarget.target !== '_client') {
      return;
    }

    let href = hrefTarget.getAttribute('href');
    if (!href) {
      return;
    }

    if (this.props.onRoute) {
      const routeEvent: RouteEvent = {
        url: href,
        anchorNode: hrefTarget,
        preventDefault() {
          this.defaultPrevented = true;
        },
        defaultPrevented: false,
      };

      this.props.onRoute(routeEvent);

      if (routeEvent.defaultPrevented) {
        // Wait should this be here? they may want browser to handle this by deault preventing ours...
        // event.preventDefault()
        return;
      }
    }

    if (!this.isRelative(href)) {
      const converted = this.convertToRelative(href);
      if (converted) {
        href = converted;
      } else {
        return;
      }
    }

    if (href.startsWith('#')) {
      return;
    }

    // Otherwise if this url is relative, navigate on the client
    event.preventDefault();

    this.route(href);
  };

  render() {
    const { model } = this;
    return (
      <BuilderStoreContext.Consumer>
        {state => {
          this.privateState = state;
          // TODO: useEffect based on this that fetches new data and
          // populates as content={} param for fast updates
          const url =
            state.state &&
            state.state.location &&
            state.state.location.pathname + state.state.location.search;

          return (
            <div className="builder-router" data-model={model}>
              {/* TODO: move to emotion */}
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
                .builder-page-loading {
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
              <BuilderComponent
                // TODO: this key strategy is inidial bc it gives loading for full page when fetching content
                // Also sometimes content flashes to loading even when it's already precached in memory and should immediately display
                // - why
                key={url}
                data={this.props.data}
                content={this.routed ? undefined : this.props.content}
                modelName={model}
                options={{
                  key: Builder.isEditing ? undefined : this.model + ':' + url, // TODO: other custom targets specify if should refetch components on change
                }}
              >
                {/* TODO: builder blocks option for loading stuff */}
                {/* TODO: input for builder blocks for this */}
                {this.props.children || (
                  <div css={{ display: 'flex' }}>
                    <div css={{ margin: '40vh auto' }} className="builder-page-loading" />
                  </div>
                )}
              </BuilderComponent>
            </div>
          );
        }}
      </BuilderStoreContext.Consumer>
    );
  }

  private findHrefTarget(event: MouseEvent | TouchEvent): HTMLAnchorElement | null {
    // TODO: move to core
    let element = event.target as HTMLElement | null;

    while (element) {
      if (element instanceof HTMLAnchorElement && element.getAttribute('href')) {
        return element;
      }

      if (element === event.currentTarget) {
        break;
      }

      element = element.parentElement;
    }

    return null;
  }

  private isRelative(href: string) {
    return !href.match(/^(\/\/|https?:\/\/)/i);
  }

  private privateState: {
    state: any;
    update: (mutator: (state: any) => any) => void;
  } | null = null;

  // This method can only be called client side only. It is only invoked on click events
  private parseUrl(url: string) {
    const a = document.createElement('a');
    a.href = url;
    return a;
  }

  private convertToRelative(href: string): string | null {
    const currentUrl = this.parseUrl(location.href);
    const hrefUrl = this.parseUrl(href);

    if (currentUrl.host === hrefUrl.host) {
      const relativeUrl = hrefUrl.pathname + (hrefUrl.search ? hrefUrl.search : '');

      if (relativeUrl.startsWith('#')) {
        return null;
      }
      return relativeUrl || '/';
    }

    return null;
  }
}

export const Router = withBuilder(RouterComponent, {
  name: 'Core:Router',
  hideFromInsertMenu: true,
  // TODO: advanced: true
  inputs: [
    {
      // TODO: search picker
      name: 'model',
      type: 'string',
      defaultValue: 'page',
      advanced: true,
    },
    {
      name: 'handleRouting',
      type: 'boolean',
      defaultValue: true,
      advanced: true,
    },
    {
      name: 'preloadOnHover',
      type: 'boolean',
      defaultValue: true,
      advanced: true,
    },
    {
      name: 'onRoute',
      type: 'function',
      advanced: true,
      // Subfields are function arguments - object with properties
    },
  ],
});
