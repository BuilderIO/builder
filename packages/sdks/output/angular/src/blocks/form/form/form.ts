import { Component, ViewChild, ElementRef, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

/**
 * This import is used by the Svelte SDK. Do not remove.
 */

export type FormProps = BuilderDataProps &
  BuilderComponentsProp &
  BuilderLinkComponentProp & {
    attributes?: any;
    name?: string;
    action?: string;
    validate?: boolean;
    method?: string;
    sendSubmissionsTo?: string;
    sendSubmissionsToEmail?: string;
    sendWithJs?: boolean;
    contentType?: string;
    customHeaders?: {
      [key: string]: string;
    };
    successUrl?: string;
    previewState?: FormState;
    successMessage?: BuilderBlock[];
    errorMessage?: BuilderBlock[];
    sendingMessage?: BuilderBlock[];
    resetFormOnSubmit?: boolean;
    errorMessagePath?: string;
  };
/**
 * This import is used by the Svelte SDK. Do not remove.
 */

export type FormState = "unsubmitted" | "sending" | "success" | "error";

import Block from "../../../components/block/block";
import Blocks from "../../../components/blocks/blocks";
import { getEnv } from "../../../functions/get-env";
import { get } from "../../../functions/get";
import { isEditing } from "../../../functions/is-editing";
import { set } from "../../../functions/set";
import type { BuilderBlock } from "../../../types/builder-block";
import type {
  BuilderComponentsProp,
  BuilderDataProps,
  BuilderLinkComponentProp,
} from "../../../types/builder-props";
import type { Dictionary } from "../../../types/typescript";
import { filterAttrs } from "../../helpers";
import { setAttrs } from "../../helpers";

@Component({
  selector: "form-component, FormComponent",
  template: `
    <form
      [attr.validate]="validate"
      #formRef
      [attr.action]="!sendWithJs && action"
      [attr.method]="method"
      [attr.name]="name"
      (submit)="onSubmit($event)"
    >
      <ng-container *ngIf="builderBlock && builderBlock.children">
        <ng-container
          *ngFor="let block of builderBlock?.children; let idx = index; trackBy: trackByBlock0"
        >
          <block
            [block]="block"
            [context]="builderContext"
            [registeredComponents]="builderComponents"
            [linkComponent]="builderLinkComponent"
          ></block>
        </ng-container>
      </ng-container>
      <ng-container *ngIf="node_1_Show">
        <blocks
          path="errorMessage"
          [blocks]="errorMessage!"
          [context]="builderContext"
        ></blocks>
      </ng-container>
      <ng-container *ngIf="node_2_Show">
        <blocks
          path="sendingMessage"
          [blocks]="sendingMessage!"
          [context]="builderContext"
        ></blocks>
      </ng-container>
      <ng-container *ngIf="node_3_Show">
        <pre class="builder-form-error-text pre">{{node_4_div}}</pre>
      </ng-container>
      <ng-container *ngIf="node_5_Show">
        <blocks
          path="successMessage"
          [blocks]="successMessage!"
          [context]="builderContext"
        ></blocks>
      </ng-container>
    </form>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .pre {
        padding: 10px;
        color: red;
        text-align: center;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, Block, Blocks],
})
export default class FormComponent {
  @Input() builderContext!: FormProps["builderContext"];
  @Input() previewState!: FormProps["previewState"];
  @Input() sendWithJs!: FormProps["sendWithJs"];
  @Input() sendSubmissionsTo!: FormProps["sendSubmissionsTo"];
  @Input() action!: FormProps["action"];
  @Input() customHeaders!: FormProps["customHeaders"];
  @Input() contentType!: FormProps["contentType"];
  @Input() sendSubmissionsToEmail!: FormProps["sendSubmissionsToEmail"];
  @Input() name!: FormProps["name"];
  @Input() method!: FormProps["method"];
  @Input() errorMessagePath!: FormProps["errorMessagePath"];
  @Input() resetFormOnSubmit!: FormProps["resetFormOnSubmit"];
  @Input() successUrl!: FormProps["successUrl"];
  @Input() validate!: FormProps["validate"];
  @Input() attributes!: FormProps["attributes"];
  @Input() builderBlock!: FormProps["builderBlock"];
  @Input() builderComponents!: FormProps["builderComponents"];
  @Input() builderLinkComponent!: FormProps["builderLinkComponent"];
  @Input() errorMessage!: FormProps["errorMessage"];
  @Input() sendingMessage!: FormProps["sendingMessage"];
  @Input() successMessage!: FormProps["successMessage"];

  @ViewChild("formRef") formRef!: ElementRef;

  formState = "unsubmitted";
  responseData = null;
  formErrorMessage = "";
  mergeNewRootState(newData: Dictionary<any>) {
    const combinedState = {
      ...this.builderContext.rootState,
      ...newData,
    };
    if (this.builderContext.rootSetState) {
      this.builderContext.rootSetState?.(combinedState);
    } else {
      this.builderContext.rootState = combinedState;
    }
  }
  submissionState() {
    return (isEditing() && this.previewState) || this.formState;
  }
  onSubmit(event: any) {
    const sendWithJsProp =
      this.sendWithJs || this.sendSubmissionsTo === "email";
    if (this.sendSubmissionsTo === "zapier") {
      event.preventDefault();
    } else if (sendWithJsProp) {
      if (!(this.action || this.sendSubmissionsTo === "email")) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      const el = event.currentTarget || event.target;
      const headers = this.customHeaders || {};
      let body: any;
      const formData = new FormData(el);

      // TODO: maybe support null
      const formPairs: {
        key: string;
        value: File | boolean | number | string | FileList;
      }[] = Array.from(el.querySelectorAll("input,select,textarea"))
        .filter((el) => !!(el as HTMLInputElement).name)
        .map((el) => {
          let value: any;
          const key = (el as HTMLImageElement).name;
          if (el instanceof HTMLInputElement) {
            if (el.type === "radio") {
              if (el.checked) {
                value = el.name;
                return {
                  key,
                  value,
                };
              }
            } else if (el.type === "checkbox") {
              value = el.checked;
            } else if (el.type === "number" || el.type === "range") {
              const num = el.valueAsNumber;
              if (!isNaN(num)) {
                value = num;
              }
            } else if (el.type === "file") {
              // TODO: one vs multiple files
              value = el.files;
            } else {
              value = el.value;
            }
          } else {
            value = (el as HTMLInputElement).value;
          }
          return {
            key,
            value,
          };
        });
      let formContentType = this.contentType;
      if (this.sendSubmissionsTo === "email") {
        formContentType = "multipart/form-data";
      }
      Array.from(formPairs).forEach(({ value }) => {
        if (
          value instanceof File ||
          (Array.isArray(value) && value[0] instanceof File) ||
          value instanceof FileList
        ) {
          formContentType = "multipart/form-data";
        }
      });

      // TODO: send as urlEncoded or multipart by default
      // because of ease of use and reliability in browser API
      // for encoding the form?
      if (formContentType !== "application/json") {
        body = formData;
      } else {
        // Json
        const json = {};
        Array.from(formPairs).forEach(({ value, key }) => {
          set(json, key, value);
        });
        body = JSON.stringify(json);
      }
      if (formContentType && formContentType !== "multipart/form-data") {
        if (
          /* Zapier doesn't allow content-type header to be sent from browsers */
          !(sendWithJsProp && this.action?.includes("zapier.com"))
        ) {
          headers["content-type"] = formContentType;
        }
      }
      const presubmitEvent = new CustomEvent("presubmit", {
        detail: {
          body,
        },
      });
      if (this.formRef.nativeElement) {
        this.formRef.nativeElement.dispatchEvent(presubmitEvent);
        if (presubmitEvent.defaultPrevented) {
          return;
        }
      }
      this.formState = "sending";
      const formUrl = `${
        getEnv() === "dev" ? "http://localhost:5000" : "https://builder.io"
      }/api/v1/form-submit?apiKey=${this.builderContext.apiKey}&to=${btoa(
        this.sendSubmissionsToEmail || ""
      )}&name=${encodeURIComponent(this.name || "")}`;
      fetch(
        this.sendSubmissionsTo === "email"
          ? formUrl
          : this.action! /* TODO: throw error if no action URL */,
        {
          body,
          headers,
          method: this.method || "post",
        }
      ).then(
        async (res) => {
          let body;
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            body = await res.json();
          } else {
            body = await res.text();
          }
          if (!res.ok && this.errorMessagePath) {
            /* TODO: allow supplying an error formatter function */
            let message = get(body, this.errorMessagePath);
            if (message) {
              if (typeof message !== "string") {
                /* TODO: ideally convert json to yaml so it woul dbe like
            error: - email has been taken */
                message = JSON.stringify(message);
              }
              this.formErrorMessage = message;
              this.mergeNewRootState({
                formErrorMessage: message,
              });
            }
          }
          this.responseData = body;
          this.formState = res.ok ? "success" : "error";
          if (res.ok) {
            const submitSuccessEvent = new CustomEvent("submit:success", {
              detail: {
                res,
                body,
              },
            });
            if (this.formRef.nativeElement) {
              this.formRef.nativeElement.dispatchEvent(submitSuccessEvent);
              if (submitSuccessEvent.defaultPrevented) {
                return;
              }
              /* TODO: option to turn this on/off? */
              if (this.resetFormOnSubmit !== false) {
                this.formRef.nativeElement.reset();
              }
            }

            /* TODO: client side route event first that can be preventDefaulted */
            if (this.successUrl) {
              if (this.formRef.nativeElement) {
                const event = new CustomEvent("route", {
                  detail: {
                    url: this.successUrl,
                  },
                });
                this.formRef.nativeElement.dispatchEvent(event);
                if (!event.defaultPrevented) {
                  location.href = this.successUrl;
                }
              } else {
                location.href = this.successUrl;
              }
            }
          }
        },
        (err) => {
          const submitErrorEvent = new CustomEvent("submit:error", {
            detail: {
              error: err,
            },
          });
          if (this.formRef.nativeElement) {
            this.formRef.nativeElement.dispatchEvent(submitErrorEvent);
            if (submitErrorEvent.defaultPrevented) {
              return;
            }
          }
          this.responseData = err;
          this.formState = "error";
        }
      );
    }
  }
  node_1_Show = null;
  node_2_Show = null;
  node_3_Show = null;
  node_4_div = null;
  node_5_Show = null;
  trackByBlock0(idx, block) {
    return `form-block-${idx}`;
  }

  ngOnInit() {
    this.node_1_Show = this.submissionState() === "error";
    this.node_2_Show = this.submissionState() === "sending";
    this.node_3_Show = this.submissionState() === "error" && this.responseData;
    this.node_4_div = JSON.stringify(this.responseData, null, 2);
    this.node_5_Show = this.submissionState() === "success";
  }

  ngOnChanges() {
    if (typeof window !== "undefined") {
      this.node_1_Show = this.submissionState() === "error";
      this.node_2_Show = this.submissionState() === "sending";
      this.node_3_Show =
        this.submissionState() === "error" && this.responseData;
      this.node_4_div = JSON.stringify(this.responseData, null, 2);
      this.node_5_Show = this.submissionState() === "success";
    }
  }
}
