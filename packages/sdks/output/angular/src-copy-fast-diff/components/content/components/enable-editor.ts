import {
  Component,
  ViewChild,
  ElementRef,
  Input,
  ViewContainerRef,
  TemplateRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";

type BuilderEditorProps = Omit<
  ContentProps,
  | "customComponents"
  | "apiVersion"
  | "isSsrAbTest"
  | "blocksWrapper"
  | "blocksWrapperProps"
  | "isNestedRender"
  | "linkComponent"
> & {
  builderContextSignal: BuilderContextInterface;
  setBuilderContextSignal?: (signal: any) => any;
  children?: any;
};

import builderContext from "../../../context/builder.context";
import type { BuilderContextInterface } from "../../../context/types";
import { evaluate } from "../../../functions/evaluate/index";
import { fastClone } from "../../../functions/fast-clone";
import { fetchOneEntry } from "../../../functions/get-content/index";
import { fetch } from "../../../functions/get-fetch";
import { isBrowser } from "../../../functions/is-browser";
import { isEditing } from "../../../functions/is-editing";
import { isPreviewing } from "../../../functions/is-previewing";
import { createRegisterComponentMessage } from "../../../functions/register-component";
import { _track } from "../../../functions/track/index";
import { getInteractionPropertiesForEvent } from "../../../functions/track/interaction";
import { getDefaultCanTrack } from "../../../helpers/canTrack";
import { logger } from "../../../helpers/logger";
import { postPreviewContent } from "../../../helpers/preview-lru-cache/set";
import { createEditorListener } from "../../../helpers/subscribe-to-editor";
import {
  registerInsertMenu,
  setupBrowserForEditing,
} from "../../../scripts/init-editing";
import type { BuilderContent } from "../../../types/builder-content";
import type { ComponentInfo } from "../../../types/components";
import type { Dictionary } from "../../../types/typescript";
import { triggerAnimation } from "../../block/animator";
import DynamicDiv from "../../dynamic-div";
import type {
  BuilderComponentStateChange,
  ContentProps,
} from "../content.types";
import { getWrapperClassName } from "./styles.helpers";

@Component({
  selector: "enable-editor, EnableEditor",
  template: `
    <ng-template #contentwrapperTemplate><ng-content></ng-content></ng-template>
    <ng-container *ngIf="builderContextSignal.content">
      <ng-container
        *ngComponentOutlet="
              ContentWrapper;
              inputs: mergedInputs_5xe0fc;
              content: myContent;
              "
      ></ng-container>
    </ng-container>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule],
})
export default class EnableEditor {
  builderContext = builderContext;

  @Input() locale!: BuilderEditorProps["locale"];
  @Input() enrich!: BuilderEditorProps["enrich"];
  @Input() trustedHosts!: BuilderEditorProps["trustedHosts"];
  @Input() builderContextSignal!: BuilderEditorProps["builderContextSignal"];
  @Input() canTrack!: BuilderEditorProps["canTrack"];
  @Input() apiKey!: BuilderEditorProps["apiKey"];
  @Input() model!: BuilderEditorProps["model"];
  @Input() content!: BuilderEditorProps["content"];
  @Input() data!: BuilderEditorProps["data"];
  @Input() showContent!: BuilderEditorProps["showContent"];
  @Input() contentWrapper!: BuilderEditorProps["contentWrapper"];
  @Input() context!: BuilderEditorProps["context"];
  @Input() contentWrapperProps!: BuilderEditorProps["contentWrapperProps"];

  @ViewChild("elementRef") elementRef!: ElementRef;

  @ViewChild("contentwrapperTemplate", { static: true })
  contentwrapperTemplateRef!: TemplateRef<any>;

  myContent?: any[][];

  mergeNewRootState(newData: Dictionary<any>) {
    const combinedState = {
      ...this.builderContextSignal.rootState,
      ...newData,
    };
    if (this.builderContextSignal.rootSetState) {
      this.builderContextSignal.rootSetState?.(combinedState);
    } else {
      this.builderContextSignal.rootState = combinedState;
    }
  }
  mergeNewContent(newContent: BuilderContent) {
    const newContentValue = {
      ...this.builderContextSignal.content,
      ...newContent,
      data: {
        ...this.builderContextSignal.content?.data,
        ...newContent?.data,
      },
      meta: {
        ...this.builderContextSignal.content?.meta,
        ...newContent?.meta,
        breakpoints:
          newContent?.meta?.breakpoints ||
          this.builderContextSignal.content?.meta?.breakpoints,
      },
    };
    this.builderContextSignal.content = newContentValue;
  }
  get showContentProps() {
    return this.showContent
      ? {}
      : {
          hidden: true,
          "aria-hidden": true,
        };
  }
  ContentWrapper = this.contentWrapper || DynamicDiv;
  processMessage(event: MessageEvent) {
    return createEditorListener({
      model: this.model,
      trustedHosts: this.trustedHosts,
      callbacks: {
        configureSdk: (messageContent) => {
          const { breakpoints, contentId } = messageContent;
          if (
            !contentId ||
            contentId !== this.builderContextSignal.content?.id
          ) {
            return;
          }
          if (breakpoints) {
            this.mergeNewContent({
              meta: {
                breakpoints,
              },
            });
          }
        },
        animation: (animation) => {
          triggerAnimation(animation);
        },
        contentUpdate: (newContent) => {
          this.mergeNewContent(newContent);
        },
      },
    })(event);
  }
  evaluateJsCode() {
    // run any dynamic JS code attached to content
    const jsCode = this.builderContextSignal.content?.data?.jsCode;
    if (jsCode) {
      evaluate({
        code: jsCode,
        context: this.context || {},
        localState: undefined,
        rootState: this.builderContextSignal.rootState,
        rootSetState: this.builderContextSignal.rootSetState,
        /**
         * We don't want to cache the result of the JS code, since it's arbitrary side effect code.
         */
        enableCache: false,
      });
    }
  }
  httpReqsData = {};
  httpReqsPending = {};
  clicked = false;
  onClick(event: any) {
    if (this.builderContextSignal.content) {
      const variationId = this.builderContextSignal.content?.testVariationId;
      const contentId = this.builderContextSignal.content?.id;
      _track({
        type: "click",
        canTrack: getDefaultCanTrack(this.canTrack),
        contentId,
        apiKey: this.apiKey,
        variationId: variationId !== contentId ? variationId : undefined,
        ...getInteractionPropertiesForEvent(event),
        unique: !this.clicked,
      });
    }
    if (!this.clicked) {
      this.clicked = true;
    }
  }
  runHttpRequests() {
    const requests: {
      [key: string]: string;
    } = this.builderContextSignal.content?.data?.httpRequests ?? {};
    Object.entries(requests).forEach(([key, url]) => {
      if (!url) return;

      // request already in progress
      if (this.httpReqsPending[key]) return;

      // request already completed, and not in edit mode
      if (this.httpReqsData[key] && !isEditing()) return;
      this.httpReqsPending[key] = true;
      const evaluatedUrl = url.replace(/{{([^}]+)}}/g, (_match, group) =>
        String(
          evaluate({
            code: group,
            context: this.context || {},
            localState: undefined,
            rootState: this.builderContextSignal.rootState,
            rootSetState: this.builderContextSignal.rootSetState,
            enableCache: true,
          })
        )
      );
      fetch(evaluatedUrl)
        .then((response) => response.json())
        .then((json) => {
          this.mergeNewRootState({
            [key]: json,
          });
          this.httpReqsData[key] = true;
        })
        .catch((err) => {
          console.error("error fetching dynamic data", url, err);
        })
        .finally(() => {
          this.httpReqsPending[key] = false;
        });
    });
  }
  emitStateUpdate() {
    if (isEditing()) {
      window.dispatchEvent(
        new CustomEvent<BuilderComponentStateChange>(
          "builder:component:stateChange",
          {
            detail: {
              state: fastClone(this.builderContextSignal.rootState),
              ref: {
                name: this.model,
              },
            },
          }
        )
      );
    }
  }
  node_1_state_ContentWrapper = null;
  mergedInputs_5xe0fc = null;

  constructor(private vcRef: ViewContainerRef) {}

  ngOnInit() {
    this.node_1_state_ContentWrapper = getWrapperClassName(
      this.content?.testVariationId || this.content?.id
    );
    this.mergedInputs_5xe0fc = {
      ref: this.elementRef,
      onClick: this.onClick.bind(this),
      "builder-content-id": this.builderContextSignal.content?.id,
      "builder-model": this.model,
      ...this.showContentProps,
      ...this.contentWrapperProps,
      class: this.node_1_state_ContentWrapper,
    };

    if (typeof window !== "undefined") {
      const onMountHook_0 = () => {
        if (isBrowser()) {
          if (isEditing()) {
            window.addEventListener("message", this.processMessage.bind(this));
            registerInsertMenu();
            setupBrowserForEditing({
              ...(this.locale
                ? {
                    locale: this.locale,
                  }
                : {}),
              ...(this.enrich
                ? {
                    enrich: this.enrich,
                  }
                : {}),
              ...(this.trustedHosts
                ? {
                    trustedHosts: this.trustedHosts,
                  }
                : {}),
            });
            Object.values<ComponentInfo>(
              this.builderContextSignal.componentInfos
            ).forEach((registeredComponent) => {
              const message =
                createRegisterComponentMessage(registeredComponent);
              window.parent?.postMessage(message, "*");
            });
            window.addEventListener(
              "builder:component:stateChangeListenerActivated",
              this.emitStateUpdate
            );
          }
          const shouldTrackImpression =
            this.builderContextSignal.content &&
            getDefaultCanTrack(this.canTrack);
          if (shouldTrackImpression) {
            const variationId =
              this.builderContextSignal.content?.testVariationId;
            const contentId = this.builderContextSignal.content?.id;
            const apiKeyProp = this.apiKey;
            _track({
              type: "impression",
              canTrack: true,
              contentId,
              apiKey: apiKeyProp!,
              variationId: variationId !== contentId ? variationId : undefined,
            });
          }

          /**
           * Override normal content in preview mode.
           * We ignore this when editing, since the edited content is already being sent from the editor via post messages.
           */
          if (isPreviewing() && !isEditing()) {
            const searchParams = new URL(location.href).searchParams;
            const searchParamPreviewModel = searchParams.get("builder.preview");
            const searchParamPreviewId = searchParams.get(
              `builder.overrides.${searchParamPreviewModel}`
            );
            const previewApiKey =
              searchParams.get("apiKey") || searchParams.get("builder.space");

            /**
             * Make sure that:
             * - the preview model name is the same as the one we're rendering, since there can be multiple models rendered
             *  at the same time, e.g. header/page/footer.
             * - the API key is the same, since we don't want to preview content from other organizations.
             * - if there is content, that the preview ID is the same as that of the one we receive.
             *
             * TO-DO: should we only update the state when there is a change?
             **/
            if (
              searchParamPreviewModel === this.model &&
              previewApiKey === this.apiKey &&
              (!this.content || searchParamPreviewId === this.content.id)
            ) {
              fetchOneEntry({
                model: this.model,
                apiKey: this.apiKey,
                apiVersion: this.builderContextSignal.apiVersion,
              }).then((content) => {
                if (content) {
                  this.mergeNewContent(content);
                }
              });
            }
          }
        }
      };
      onMountHook_0();
      const onMountHook_1 = () => {
        if (!this.apiKey) {
          logger.error(
            "No API key provided to `Content` component. This can cause issues. Please provide an API key using the `apiKey` prop."
          );
        }
        this.evaluateJsCode();
        this.runHttpRequests();
        this.emitStateUpdate();
      };
      onMountHook_1();
    }

    this.myContent = [
      this.vcRef.createEmbeddedView(this.contentwrapperTemplateRef).rootNodes,
    ];
  }

  ngOnChanges() {
    console.log('enable-editor: ngOnChanges');
    if (typeof window !== "undefined") {
      if (this.content) {
        this.mergeNewContent(this.content);
      }
      this.evaluateJsCode();
      this.runHttpRequests();
      this.emitStateUpdate();
      if (this.data) {
        this.mergeNewRootState(this.data);
      }
      if (this.locale) {
        this.mergeNewRootState({
          locale: this.locale,
        });
      }
      this.node_1_state_ContentWrapper = getWrapperClassName(
        this.content?.testVariationId || this.content?.id
      );
      this.mergedInputs_5xe0fc = {
        ref: this.elementRef,
        onClick: this.onClick.bind(this),
        "builder-content-id": this.builderContextSignal.content?.id,
        "builder-model": this.model,
        ...this.showContentProps,
        ...this.contentWrapperProps,
        class: this.node_1_state_ContentWrapper,
      };
    }
  }

  ngOnDestroy() {
    if (isBrowser()) {
      window.removeEventListener("message", this.processMessage);
      window.removeEventListener(
        "builder:component:stateChangeListenerActivated",
        this.emitStateUpdate
      );
    }
  }
}
