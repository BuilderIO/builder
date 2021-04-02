import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  Optional,
  OnDestroy,
  OnInit,
  ViewContainerRef,
  ElementRef,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { parse } from 'url';
import { BuilderComponentService } from './builder-component.service';
import { GetContentOptions, Builder } from '@builder.io/sdk';
import { Subscription, BehaviorSubject } from 'rxjs';
import { BuilderService } from '../../services/builder.service';

function omit<T extends object>(obj: T, ...values: (keyof T)[]): Partial<T> {
  const newObject = Object.assign({}, obj);
  for (const key of values) {
    delete (newObject as any)[key];
  }
  return newObject;
}

let wcScriptInserted = false;
const NAVIGATION_TIMEOUT_DEFAULT = 1000;

function delay<T = any>(duration: number, resolveValue?: T) {
  return new Promise<T>((resolve) => setTimeout(() => resolve(resolveValue), duration));
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
export class BuilderComponentComponent implements OnDestroy, OnInit {
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
  @Input() prerender = true;

  // Sometimes user will have slow connection and when we are using Resolver on target route
  // then, application will be fully reloaded. In that case set it to false to avoid full-reload navigation.
  @Input() navigationTimeout: number | boolean = NAVIGATION_TIMEOUT_DEFAULT;

  subscriptions = new Subscription();

  visible = new BehaviorSubject(true);

  private get url() {
    const location = this.builderService.getLocation();
    return location.pathname || '';
  }

  get key() {
    const key = Builder.isEditing || !this.reloadOnRoute ? this.model : `${this.model}:${this.url}`;
    return key;
  }

  constructor(
    private viewContainer: ViewContainerRef,
    private elementRef: ElementRef,
    private builderService: BuilderService,
    @Optional() private router?: Router
  ) {}

  async ensureWCScriptLoaded() {
    const SCRIPT_ID = 'builder-wc-script';
    if (!Builder.isBrowser || wcScriptInserted || document.getElementById(SCRIPT_ID)) {
      return;
    }
    function getQueryParam(url: string, variable: string) {
      const query = url.split('?')[1] || '';
      const vars = query.split('&');
      for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) === variable) {
          return decodeURIComponent(pair[1]);
        }
      }
      return null;
    }
    const script = document.createElement('script');

    const wcVersion = getQueryParam(location.href, 'builder.wcVersion');
    script.id = SCRIPT_ID;
    // TODO: detect builder.wcVersion and if customEleemnts exists and do
    // dynamic versions and lite here
    script.src = `https://cdn.builder.io/js/webcomponents@${
      wcVersion || 'latest'
    }/dist/system/angular/builder-webcomponents-async.js`;
    script.async = true;
    wcScriptInserted = true;
    return new Promise((resolve, reject) => {
      script.addEventListener('load', resolve);
      script.addEventListener('error', (e) => reject(e.error));
      document.head.appendChild(script);
    });
  }

  async ensureWcLoadedAndUpdate() {
    await this.ensureWCScriptLoaded();
    const { onBuilderWcLoad } = window as any;
    if (onBuilderWcLoad) {
      onBuilderWcLoad((BuilderWC: any) => {
        const builder = BuilderWC.builder as Builder;
        builder.apiKey = this.builderService.apiKey;
        builder.canTrack = this.builderService.canTrack;
        builder.setUserAttributes(omit(this.builderService.getUserAttributes(), 'urlPath'));
        this.builderService.userAttributesChanged.subscribe((attrs) =>
          builder.setUserAttributes(attrs)
        );
      });
    }
  }

  ngOnInit() {
    if (this.router && this.reloadOnRoute) {
      // TODO: should the inner function return reloadOnRoute?
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    }

    if (Builder.isBrowser) {
      if (this.router) {
        this.subscriptions.add(
          this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
              if (this.reloadOnRoute) {
                // Force reload component
                this.visible.next(false);
                Builder.nextTick(() => {
                  this.visible.next(true);
                });
              }
            }
          })
        );
      }
      this.subscriptions.add(
        this.load.subscribe(async (value: any) => {
          // TODO: this may run constantly when editing - check on this, not
          // end of world but not ideal for perf
          this.viewContainer.detach();
          if (Builder.isEditing || (value && value.data && this.hydrate !== false)) {
            await this.ensureWcLoadedAndUpdate();
          }
        })
      );
    }

    if (Builder.isBrowser && (this.hydrate !== false || Builder.isEditing)) {
      this.ensureWcLoadedAndUpdate();
    }
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

    if (href.startsWith('javascript:')) {
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

    const useNavigationTimeout = !(
      typeof this.navigationTimeout === 'boolean' && !this.navigationTimeout
    );
    const timeoutPromise = delay(
      typeof this.navigationTimeout === 'number'
        ? this.navigationTimeout
        : NAVIGATION_TIMEOUT_DEFAULT,
      false
    );

    try {
      const promiseRace = useNavigationTimeout ? [timeoutPromise, routePromise] : [routePromise];
      success = await Promise.race(promiseRace);
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
