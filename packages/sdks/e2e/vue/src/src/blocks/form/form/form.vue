<template>
  <form
    :validate="validate"
    ref="formRef"
    :action="!sendWithJs && action"
    :method="method"
    :name="name"
    @submit="onSubmit($event)"
    v-bind="{ ...{}, ...filterAttrs(attributes, 'v-on:', false) }"
    v-on="filterAttrs(attributes, 'v-on:', true)"
  >
    <template v-if="builderBlock && builderBlock.children">
      <template
        :key="`form-block-${idx}`"
        v-for="(block, index) in builderBlock?.children"
      >
        <Block
          :block="block"
          :context="builderContext"
          :registeredComponents="builderComponents"
          :linkComponent="builderLinkComponent"
        ></Block>
      </template>
    </template>

    <template v-if="submissionState() === 'error'">
      <Blocks
        path="errorMessage"
        :blocks="errorMessage"
        :context="builderContext"
      ></Blocks>
    </template>

    <template v-if="submissionState() === 'sending'">
      <Blocks
        path="sendingMessage"
        :blocks="sendingMessage"
        :context="builderContext"
      ></Blocks>
    </template>

    <template v-if="submissionState() === 'error' && responseData">
      <pre class="builder-form-error-text pre-3i4ezorcfhi">{{
        JSON.stringify(responseData, null, 2)
      }}</pre>
    </template>

    <template v-if="submissionState() === 'success'">
      <Blocks
        path="successMessage"
        :blocks="successMessage"
        :context="builderContext"
      ></Blocks>
    </template>
  </form>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Block from "../../../components/block/block.vue";
import Blocks from "../../../components/blocks/blocks.vue";
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

export default defineComponent({
  name: "builder-form-component",
  components: { Block: Block, Blocks: Blocks },
  props: [
    "builderContext",
    "previewState",
    "sendWithJs",
    "sendSubmissionsTo",
    "action",
    "customHeaders",
    "contentType",
    "sendSubmissionsToEmail",
    "name",
    "method",
    "errorMessagePath",
    "resetFormOnSubmit",
    "successUrl",
    "validate",
    "attributes",
    "builderBlock",
    "builderComponents",
    "builderLinkComponent",
    "errorMessage",
    "sendingMessage",
    "successMessage",
  ],

  data() {
    return {
      formState: "unsubmitted",
      responseData: null,
      formErrorMessage: "",
      filterAttrs,
    };
  },

  methods: {
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
    },
    submissionState() {
      return (isEditing() && this.previewState) || this.formState;
    },
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
        if (this.$refs.formRef) {
          this.$refs.formRef.dispatchEvent(presubmitEvent);
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
              if (this.$refs.formRef) {
                this.$refs.formRef.dispatchEvent(submitSuccessEvent);
                if (submitSuccessEvent.defaultPrevented) {
                  return;
                }
                /* TODO: option to turn this on/off? */
                if (this.resetFormOnSubmit !== false) {
                  this.$refs.formRef.reset();
                }
              }

              /* TODO: client side route event first that can be preventDefaulted */
              if (this.successUrl) {
                if (this.$refs.formRef) {
                  const event = new CustomEvent("route", {
                    detail: {
                      url: this.successUrl,
                    },
                  });
                  this.$refs.formRef.dispatchEvent(event);
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
            if (this.$refs.formRef) {
              this.$refs.formRef.dispatchEvent(submitErrorEvent);
              if (submitErrorEvent.defaultPrevented) {
                return;
              }
            }
            this.responseData = err;
            this.formState = "error";
          }
        );
      }
    },
  },
});
</script>

<style scoped>
.pre-3i4ezorcfhi {
  padding: 10px;
  color: red;
  text-align: center;
}
</style>