import {
  Directive,
  EmbeddedViewRef,
  Input,
  Optional,
  Renderer,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { makeStateKey, StateKey, TransferState } from '@angular/platform-browser';
import { BuilderContentService } from '../services/builder-content.service';
// FIXME: tsconfig paths? install module? use lerna...
import { BuilderService } from '../services/builder.service';
import { Builder, Subscription as BuilderSubscription } from '@builder.io/sdk';
import { BuilderComponentService } from '../components/builder-component/builder-component.service';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';

declare let Zone: any;

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

  constructor(
    private _viewContainer: ViewContainerRef,
    private renderer: Renderer,
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

  ngOnInit() {
    this.request();

    console.log(1);
    if (this.router) {
      console.log(2);
      this.subscriptions.add(
        this.router.events.subscribe(event => {
          // TODO: this doesn't trigger
          console.log(3);
          if (event instanceof NavigationEnd) {
            console.log(4);
            if (this.reloadOnRoute) {
              console.log(5);
              const viewRef = this._viewRef;
              if (viewRef && viewRef.destroyed) {
                return;
              }

              console.log(6);
              if (this.url !== this.lastUrl) {
                console.log(7);
                // TODO: listen to any target change? This just updates target?

                // TODO: track last fetched ID and don't replace dom if on new url the content is the same...
                this.clickTracked = false;
                // Verify the route didn't result in this component being destroyed
                this.request();
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
    if (this.matchId) {
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

  // TODO: limit?
  // TODO: context with index, etc
  @Input()
  set builderModel(model: string) {
    if (!model) {
      return;
    }
    this._context.model = model;
    this._updateView();
    this.stateKey = makeStateKey(
      'builder:' + model + ':' + (this.reloadOnRoute ? this.router && this.router.url : '')
    );
    // this.request();
    const rootNode = this._viewRef!.rootNodes[0];
    this.renderer.setElementAttribute(rootNode, 'builder-model', model);
    this.renderer.setElementAttribute(rootNode, 'builder-model-name', model.replace(/-/g, ' '));
    this.renderer.listen(rootNode, 'click', (event: MouseEvent) => this.onClick(event));
  }

  private get url() {
    if (this.router) {
      return this.router.url;
    }
    const location = this.builder.getLocation();
    return (location.pathname || '') + (location.search || '');
  }

  // TODO: service for this
  request() {
    this.lastUrl = this.url;

    console.log('a0')

    const viewRef = this._viewRef;
    if (viewRef && viewRef.destroyed) {
      return;
    }

    const noop = () => null;
    const task = Zone.current.scheduleMacroTask('getBuilderContent', noop, {}, noop, noop);
    let receivedFirstResponse = false;
    const model = this._context.model as string;

    const initialContent =
      this.transferState && this.transferState.get(this.stateKey!, null as any);

    // TODO: if not multipe

    if (this.contentSubscription) {
      // TODO: cancel a request if one is pending... or set some kind of flag
      this.contentSubscription.unsubscribe();
    }
    console.log('a')
    const subscription = (this.contentSubscription = this.builder
      .queueGetContent(model, {
        initialContent,
        key:
          Builder.isEditing || !this.reloadOnRoute
            ? model
            : `${model}:${this.router && this.router.url}`,
      })
      .subscribe(
        result => {
          console.log('b')
          // Cancel handling request if new one created or they have been canceled, to avoid race conditions
          // if multiple routes or other events happen
          if (this.contentSubscription !== subscription) {
            console.log('c')
            if (!receivedFirstResponse) {
              console.log('d')
              setTimeout(() => {
                task.invoke();
              });
            }
            return;
          }

          console.log('e')

          if (result.id === this.lastContentId) {
            return;
          }

          console.log('f')

          this.lastContentId = result.id;

          if (this.transferState) {
            this.transferState.set(this.stateKey!, result);
          }
          // tslint:disable-next-line:no-non-null-assertion
          const viewRef = this._viewRef!;

          if (viewRef.destroyed) {
            console.log('g')
            this.subscriptions.unsubscribe();
            if (this.contentSubscription) {
              this.contentSubscription.unsubscribe();
            }
            return;
          }

          console.log('h')

          if (Builder.isBrowser) {
            const rootNode = viewRef.rootNodes[0];
            if (rootNode) {
              if (rootNode && rootNode.classList.contains('builder-editor-injected')) {
                console.log('i')
                viewRef.detach();
                return;
              }
            }
          }

          console.log('j')

          // FIXME: nasty hack to detect secondary updates vs original. Build proper support into JS SDK
          // if (this._context.loading || result.length > viewRef.context.results.length) {
          this._context.loading = false;
          // TODO: how handle singleton vs multiple
          let match = result[0];
          if (
            !match &&
            this.router &&
            this.router.url &&
            this.router.url.includes('builder.preview=' + this.builderModel)
          ) {
            console.log('k')
            match = {
              id: 'preview',
              name: 'Preview',
              data: {},
            };
          }

          if (this.component) {
            console.log('l')
            this.component.contentLoad.next(match);
          } else {
            console.log('m')
            console.warn('No component!');
          }
          if (match) {
            console.log('n')
            const rootNode = this._viewRef!.rootNodes[0];
            this.matchId = match.id;
            this.renderer.setElementAttribute(rootNode, 'builder-content-entry-id', match.id);
            this.match = match;
            viewRef.context.$implicit = match.data;
            // console.log('result', match, result);
            // viewRef.context.results = result.map(item => ({ ...item.data, $id: item.id }));
            if (this.builder.autoTrack) {
              this.builder.trackImpression(match.id, match.variationId);
            }
          }
          if (!viewRef.destroyed) {
            console.log('o')
            viewRef.detectChanges();

            // TODO: it's possible we don't want anything below to run if this has been destroyed
            if (match && match.data && match.data.animations && Builder.isBrowser) {
              Builder.nextTick(() => {
                Builder.animator.bindAnimations(match.data.animations);
              });
            }
          }

          if (!receivedFirstResponse) {
            console.log('p')
            setTimeout(() => {
              console.log('q')
              task.invoke();
            });
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
