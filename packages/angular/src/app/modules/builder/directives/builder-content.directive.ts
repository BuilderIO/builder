import {
  Directive,
  EmbeddedViewRef,
  Input,
  Optional,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
  Renderer2
} from '@angular/core';
import { makeStateKey, StateKey, TransferState } from '@angular/platform-browser';
import { BuilderContentService } from '../services/builder-content.service';
// FIXME: tsconfig paths? install module? use lerna...
import { BuilderService } from '../services/builder.service';
import { Builder, Subscription as BuilderSubscription } from '@builder.io/sdk';
import { BuilderComponentService } from '../components/builder-component/builder-component.service';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
// TODO: below is optional... they can import if needed
// import '@builder.io/widgets'

declare let Zone: any;

// let firstEverLoad = true;

// TODO: updated output
@Directive({
  selector: '[builderModel]',
  providers: [BuilderContentService],
})
export class BuilderContentDirective implements OnInit, OnDestroy {
  private get component() {
    // return BuilderService.componentInstances[this._context.model as string];
    return this.builderComponentService.contentComponentInstance;
  }

  lastContentId: string | null = null;
  lastUrl: string | null = null;

  private subscriptions = new Subscription();

  private _context: BuilderContentContext = new BuilderContentContext();
  private _templateRef: TemplateRef<BuilderContentContext> | null = null;
  private _viewRef: EmbeddedViewRef<BuilderContentContext> | null = null;
  // private _repeat = false;
  private match: any;

  private matchId = '';

  private clickTracked = false;

  hydrated = false;

  constructor(
    private _viewContainer: ViewContainerRef,
    private renderer: Renderer2,
    private builder: BuilderService,
    private builderComponentService: BuilderComponentService,
    @Optional() private transferState: TransferState,
    templateRef: TemplateRef<BuilderContentContext>,
    @Optional() private router?: Router
  ) {
    builderComponentService.contentDirectiveInstance = this;
    this._templateRef = templateRef;
  }

  // TODO: pass this option down from builder-component
  @Input() reloadOnRoute = true;

  contentSubscription: BuilderSubscription | null = null;

  stateKey: StateKey<any> | undefined;

  requesting = true;

  reset() {
    // TODO: listen to any target change? This just updates target?

    // TODO: track last fetched ID and don't replace dom if on new url the content is the same...
    this.clickTracked = false;
    this.hydrated = false;
    // Verify the route didn't result in this component being destroyed
    this.request();
  }

  ngOnInit() {
    const noop = () => null;
    const task = Zone.current.scheduleMacroTask('builderFetchNextTick', noop, {}, noop, noop);
    Builder.nextTick(() => {
      this.request();
      task.invoke();
    });

    if (this.router) {
      this.subscriptions.add(
        this.router.events.subscribe(event => {
          // TODO: this doesn't trigger
          if (event instanceof NavigationEnd) {
            if (this.reloadOnRoute) {
              const viewRef = this._viewRef;
              if (viewRef && viewRef.destroyed) {
                return;
              }

              if (this.url !== this.lastUrl) {
                this.reset();
              }
            }
          }
        })
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    if (this.contentSubscription) {
      this.contentSubscription.unsubscribe();
    }
  }

  // TODO: have another option for this or get from metadata
  // @Input()
  // set modelMultiple(repeat: boolean) {
  //   this._repeat = repeat;
  // }

  // @HostListener('click')
  onClick(event: MouseEvent) {
    if (this.matchId && !this.hydrated) {
      const match = this.match;
      if (this.builder.autoTrack) {
        this.builder.trackInteraction(
          this.matchId,
          match && match.variationId,
          this.clickTracked,
          event
        );
      }
      this.clickTracked = true;
    }

    // TODO: only in editor mode
    // TODO: put messaging on builder class
    if (document.body.classList.contains('builder-editing')) {
      if (this.matchId) {
        // TODO: get event object and pass mouse coordinages
        window.parent.postMessage(
          {
            type: 'builder.clickContent',
            data: {
              id: this.matchId,
              model: this._context.model,
            },
          },
          '*'
        );
      } else {
        window.parent.postMessage(
          {
            type: 'builder.clickModel',
            data: {
              model: this._context.model,
            },
          },
          '*'
        );
      }
    }
  }

  get stateKeyString() {
    return 'builder:' + this._context.model + ':' + (this.reloadOnRoute ? this.url : '');
  }

  // TODO: limit?
  // TODO: context with index, etc
  @Input()
  set builderModel(model: string) {
    if (!model) {
      return;
    }
    this._context.model = model;
    this._updateView();
    this.stateKey = makeStateKey(this.stateKeyString);
    // this.request();
    const rootNode = this._viewRef!.rootNodes[0];
    this.renderer.setAttribute(rootNode, 'builder-model', model);
    this.renderer.setAttribute(rootNode, 'builder-model-name', model.replace(/-/g, ' '));
    this.renderer.listen(rootNode, 'click', (event: MouseEvent) => this.onClick(event));
  }

  private get url() {
    const location = this.builder.getLocation();
    return location.pathname || ''; // + (location.search || '');
  }

  // TODO: service for this
  request() {
    this.lastUrl = this.url;
    this.requesting = true;

    if (this.component && !this.component.prerender) {
      return;
    }

    const viewRef = this._viewRef;
    if (viewRef && viewRef.destroyed) {
      return;
    }

    const noop = () => null;
    const task = Zone.current.scheduleMacroTask('getBuilderContent', noop, {}, noop, noop);
    let receivedFirstResponse = false;
    const model = this._context.model as string;

    const options = this.component && this.component.options;

    const initialContent =
      (this.component && this.component.content) ||
      (Builder.isBrowser &&
        // firstEverLoad &&
        this.transferState &&
        this.transferState.get(this.stateKeyString as any, null as any));

    // firstEverLoad = false;

    // TODO: if not multipe

    if (this.contentSubscription) {
      // TODO: cancel a request if one is pending... or set some kind of flag
      this.contentSubscription.unsubscribe();
    }

    const hydrate = Builder.isBrowser && this.component && this.component.hydrate;

    const key = Builder.isEditing || !this.reloadOnRoute ? model : `${model}:${this.url}`;
    const subscription = (this.contentSubscription = this.builder
      .queueGetContent(model, {
        initialContent,
        key,
        ...options,
        prerender: true,
        static: !hydrate,
      })
      .subscribe(
        (result: any[]) => {
          let match = result[0];
          // Cancel handling request if new one created or they have been canceled, to avoid race conditions
          // if multiple routes or other events happen
          if (this.contentSubscription !== subscription) {
            if (!receivedFirstResponse) {
            }
            setTimeout(() => {
              task.invoke();
            });
            return;
          }

          if (match && match.id === this.lastContentId) {
            setTimeout(() => {
              task.invoke();
            });
            return;
          }

          this.lastContentId = match && match.id;

          if (this.transferState && !Builder.isBrowser) {
            this.transferState.set(this.stateKeyString as any, result);
          }
          // tslint:disable-next-line:no-non-null-assertion
          const viewRef = this._viewRef!;

          if (viewRef.destroyed) {
            this.subscriptions.unsubscribe();
            if (this.contentSubscription) {
              this.contentSubscription.unsubscribe();
            }
            return;
          }

          const rootNode = Builder.isBrowser && viewRef.rootNodes[0];

          if (Builder.isBrowser) {
            if (rootNode) {
              if (rootNode && rootNode.classList.contains('builder-editor-injected')) {
                viewRef.detach();
                setTimeout(() => {
                  task.invoke();
                });
                return;
              }
              setTimeout(() => {
                if (hydrate && rootNode && match && match.data && match.data.html) {
                  // TODO: hydrate with webcomponents... here instead of builder component wrapper?
                  // // TODO: two builder SDKs are loading...? external in react right?
                  // const subscription = this.builder
                  //   .get(model, {
                  //     key: key,
                  //     ...options,
                  //     prerender: false,
                  //   })
                  //   .subscribe(
                  //     async data => {
                  //       viewRef.detach();
                  //       // Maaaybe shouldn't be rootnode
                  //       BuilderComponent.renderInto(rootNode, {
                  //         // Differnt builder SDK instance?? Might be debug/link thing
                  //         apiKey: this.builder.apiKey!,
                  //         modelName: model,
                  //         options: {
                  //           entry: data ? data.id : undefined,
                  //           initialContent: data ? [data] : undefined,
                  //           key: key,
                  //         },
                  //         data: this.component && this.component.data,
                  //       });
                  //       this.hydrated = true;
                  //       subscription.unsubscribe();
                  //       if (Builder.isEditing) {
                  //         setTimeout(() => {
                  //           parent.postMessage({ type: 'builder.updateContent' }, '*');
                  //           setTimeout(() => {
                  //             parent.postMessage(
                  //               { type: 'builder.sdkInjected', data: { modelName: name } },
                  //               '*'
                  //             );
                  //           }, 100);
                  //         }, 100);
                  //       }
                  //     },
                  //     async (error: any) => {
                  //       // TODO
                  //     }
                  //   );
                }
              });
            }
          }

          // FIXME: nasty hack to detect secondary updates vs original. Build proper support into JS SDK
          // if (this._context.loading || result.length > viewRef.context.results.length) {
          this._context.loading = false;
          const search = this.builder.getLocation().search || '';
          // TODO: how handle singleton vs multiple
          if (!match && search.includes('builder.preview=' + this._context.model)) {
            match = {
              id: 'preview',
              name: 'Preview',
              data: {},
            };
          }

          if (this.component) {
            this.component.contentLoad.next(match);
          } else {
            console.warn('No component!');
          }
          if (match) {
            const rootNode = this._viewRef!.rootNodes[0];
            this.matchId = match.id;
            this.renderer.setAttribute(rootNode, 'builder-content-entry-id', match.id);
            this.match = match;
            viewRef.context.$implicit = match.data;
            // viewRef.context.results = result.map(item => ({ ...item.data, $id: item.id }));
            if (!hydrate && this.builder.autoTrack) {
              this.builder.trackImpression(match.id, match.variationId);
            }
          }
          if (!viewRef.destroyed) {
            viewRef.detectChanges();

            // TODO: it's possible we don't want anything below to run if this has been destroyed
            if (match && match.data && match.data.animations && Builder.isBrowser && !hydrate) {
              Builder.nextTick(() => {
                Builder.animator.bindAnimations(match.data.animations);
              });
            }
          }

          setTimeout(() => {
            task.invoke();
          });
          if (!receivedFirstResponse) {
            receivedFirstResponse = true;
          }
        },
        error => {
          if (this.component) {
            this.component.contentError.next(error);
          } else {
            console.warn('No component!');
          }
          if (!receivedFirstResponse) {
            // TODO: how to zone error
            task.invoke();
            receivedFirstResponse = true;
          }
        }
      ));
  }

  private _updateView() {
    if (this._context.model) {
      this._viewContainer.clear();
      if (this._templateRef) {
        this._viewRef = this._viewContainer.createEmbeddedView(this._templateRef, this._context);
      }
    }
  }
}

export class BuilderContentContext {
  $implicit?: any;
  match?: any;
  model?: string;
  loading = true;
  results: any[] = [];
}
