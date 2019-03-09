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
import { Router, NavigationEnd } from '@angular/router';
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
    @Optional() private router: Router,
    templateRef: TemplateRef<BuilderContentContext>
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

    if (this.router) {
      this.subscriptions.add(
        this.router.events.subscribe(event => {
          // TODO: use NavigationEnd?
          if (event instanceof NavigationEnd) {
            if (this.reloadOnRoute) {
              const viewRef = this._viewRef;
              if (viewRef && viewRef.destroyed) {
                return;
              }
              this.clickTracked = false;
              // Verify the route didn't result in this component being destroyed
              this.request();
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
    this.stateKey = makeStateKey('builder:' + model);
    // this.request();
    const rootNode = this._viewRef!.rootNodes[0];
    this.renderer.setElementAttribute(rootNode, 'builder-model', model);
    this.renderer.setElementAttribute(rootNode, 'builder-model-name', model.replace(/-/g, ' '));
    this.renderer.listen(rootNode, 'click', (event: MouseEvent) => this.onClick(event));
  }

  // TODO: service for this
  request() {
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
      this.contentSubscription.unsubscribe();
    }
    this.contentSubscription = this.builder.queueGetContent(model, { initialContent }).subscribe(
      result => {
        if (this.transferState) {
          this.transferState.set(this.stateKey!, result);
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

        if (Builder.isBrowser) {
          const rootNode = viewRef.rootNodes[0];
          if (rootNode) {
            if (rootNode && rootNode.classList.contains('builder-editor-injected')) {
              viewRef.detach();
              return;
            }
          }
        }

        // FIXME: nasty hack to detect secondary updates vs original. Build proper support into JS SDK
        // if (this._context.loading || result.length > viewRef.context.results.length) {
        this._context.loading = false;
        // TODO: how handle singleton vs multiple
        const match = result[0];
        if (this.component) {
          this.component.contentLoad.next(match);
        } else {
          console.warn('No component!');
        }
        if (match) {
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
          viewRef.detectChanges();

          // TODO: it's possible we don't want anything below to run if this has been destroyed
          if (match && match.data && match.data.animations && Builder.isBrowser) {
            Builder.nextTick(() => {
              Builder.animator.bindAnimations(match.data.animations);
            });
          }
        }

        if (!receivedFirstResponse) {
          setTimeout(() => {
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
    );
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
