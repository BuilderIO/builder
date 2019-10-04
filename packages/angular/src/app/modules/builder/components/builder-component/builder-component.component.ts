import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  Optional,
  OnDestroy,
  ViewContainerRef,
  ElementRef,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { parse } from 'url';
import { BuilderComponentService } from './builder-component.service';
import { GetContentOptions, Builder } from '@builder.io/sdk';
import { Subscription } from 'rxjs';
import { BuilderService } from '../../services/builder.service';

function omit<T extends object>(obj: T, ...values: (keyof T)[]): Partial<T> {
  const newObject = Object.assign({}, obj);
  for (const key of values) {
    delete (newObject as any)[key];
  }
  return newObject;
}

let wcScriptInserted = false;

function delay<T = any>(duration: number, resolveValue?: T) {
  return new Promise<T>(resolve => setTimeout(() => resolve(resolveValue), duration));
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

@Component({
  selector: 'builder-component',
  templateUrl: './builder-component.component.html',
  styleUrls: ['./builder-component.component.css'],
  providers: [BuilderComponentService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderComponentComponent implements OnDestroy {
  @Input() model: string | undefined /* THIS IS ACTUALLY REQUIRED */;

  @Input() set name(name: string | undefined) {
    this.model = name;
  }

  @Input() handleRouting = true;
  @Input() reloadOnRoute = true;

  @Output() load = new EventEmitter<any>();
  @Output() route = new EventEmitter<RouteEvent>();
  @Output() error = new EventEmitter<any>();
  @Input() content: any = null;
  @Input() options: GetContentOptions | null = null;

  @Input() data: any = {};
  @Input() hydrate = true;

  subscriptions = new Subscription();

  constructor(
    private viewContainer: ViewContainerRef,
    private elementRef: ElementRef,
    private builderService: BuilderService,
    @Optional() private router?: Router
  ) {
    // if (this.router && this.reloadOnRoute) {
    //   // TODO: should the inner function return reloadOnRoute?
    //   this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    // }

    if (Builder.isBrowser) {
      if (this.router) {
        this.subscriptions.add(
          this.router.events.subscribe(event => {
            // TODO: this doesn't trigger
            if (event instanceof NavigationEnd) {
              const { BuilderWC } = window as any;
              if (BuilderWC && this.reloadOnRoute && wcScriptInserted && this.hydrate) {
                if (
                  this.elementRef &&
                  this.elementRef.nativeElement &&
                  this.elementRef.nativeElement.getContent
                ) {
                  BuilderWC.builder.setUserAttributes(
                    omit(this.builderService.getUserAttributes(), 'urlPath')
                  );
                  // TODO: set other options based on inputs to this - options and and data
                  this.elementRef.nativeElement.setAttribute('name', this.model);
                  this.elementRef.nativeElement.setAttribute(
                    'key',
                    this.model + ':' + builderService.getUserAttributes().urlPath
                  );
                  this.elementRef.nativeElement.getContent(true);
                }
              }
            }
          })
        );
      }
      this.subscriptions.add(
        this.load.subscribe(async (value: any) => {
          // Maybe move into builder contnet directive
          if (value && value.data && value.data.needsHydration && this.hydrate !== false) {
            this.viewContainer.detach();
            if (this.reloadOnRoute) {
              this.elementRef.nativeElement.setAttribute(
                'key',
                this.model + ':' + builderService.getUserAttributes().urlPath
              );
            }

            // TODO: load webcompoennts JS if not already
            // Forward user attributes and API key to WC Builder
            // (and listen on changes to attributes to edit)
            await this.ensureWCScriptLoaded();
            const { onBuilderWcLoad } = window as any;
            if (onBuilderWcLoad) {
              onBuilderWcLoad((BuilderWC: any) => {
                BuilderWC.builder.apiKey = this.builderService.apiKey;
                BuilderWC.builder.canTrack = this.builderService.canTrack;
                // TODO: subcribe to user attributes change and upate
                BuilderWC.builder.setUserAttributes(
                  omit(this.builderService.getUserAttributes(), 'urlPath')
                );
              });
            }
          }
        })
      );
    }
  }

  async ensureWCScriptLoaded() {
    const SCRIPT_ID = 'builder-wc-script';
    if (!Builder.isBrowser || wcScriptInserted || document.getElementById(SCRIPT_ID)) {
      return;
    }
    function getQueryParam(url: string, variable: string) {
      var query = url.split('?')[1] || '';
      var vars = query.split('&');
      for (let i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) === variable) {
          return decodeURIComponent(pair[1]);
        }
      }
      return null;
    }
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://cdn.builder.io/js/webcomponents';
    script.async = true;
    wcScriptInserted = true;
    return new Promise((resolve, reject) => {
      script.addEventListener('load', resolve);
      script.addEventListener('error', e => reject(e.error));
      document.head.appendChild(script);
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // TODO: this should be in BuilderBlocks
  async onClick(event: MouseEvent) {
    if (!this.handleRouting) {
      return;
    }

    if (event.button !== 0 || event.ctrlKey || event.defaultPrevented) {
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
    if (hrefTarget.target) {
      return;
    }

    let href = hrefTarget.getAttribute('href');
    if (!href) {
      return;
    }

    const routeEvent: RouteEvent = {
      url: href,
      anchorNode: hrefTarget,
      preventDefault() {
        this.defaultPrevented = true;
      },
      defaultPrevented: false,
    };
    this.route.next(routeEvent);

    if (routeEvent.defaultPrevented) {
      event.preventDefault();
      return;
    }

    if (event.metaKey) {
      return;
    }

    if (!this.isRelative(href)) {
      const converted = this.convertToRelative(href);
      if (converted) {
        href = converted;
      } else {
        return;
      }
    }

    if (!this.router) {
      return;
    }

    // Otherwise if this url is relative, navigate on the client
    event.preventDefault();

    // Attempt to route on the client
    let success: boolean | null = null;
    const routePromise = this.router.navigateByUrl(href);
    const timeoutPromise = delay(1000, false);

    try {
      success = await Promise.race([timeoutPromise, routePromise]);
    } finally {
      // This is in a click handler so it will only run on the client
      if (success) {
        // If successful scroll the window to the top
        window.scrollTo(0, 0);
      } else {
        // Otherwise handle the routing with a page refresh on failure. Angular, by deafult
        // if it fails to load a URL (e.g. if an API request failed when loading it), instead
        // of navigating to the new page to tell the user that their click did something but
        // the resulting page has an issue, it instead just silently fails and shows the user
        // nothing. Lets make sure we route to the new page. In some cases this even brings the
        // user to a correct and valid page anyway
        location.href = `${location.protocol}//${location.host}${href}`;
      }
    }
  }

  private isRelative(href: string) {
    return !href.match(/^(\/\/|https?:\/\/)/i);
  }

  // Attempt to convert an absolute url to relative if possible (aka if the hosts match)
  private convertToRelative(href: string) {
    const currentUrl = parse(location.href);
    const hrefUrl = parse(href);

    if (currentUrl.host === hrefUrl.host) {
      const relativeUrl = hrefUrl.pathname + (hrefUrl.search ? hrefUrl.search : '');
      return relativeUrl;
    }
  }

  private findHrefTarget(event: MouseEvent): HTMLAnchorElement | null {
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
}
