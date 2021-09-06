<template>
  <form
    v-bind="attributes"
    :validate="validate"
    ref="formRef"
    :action="!sendWithJs && action"
    :method="method"
    :name="name"
    @submit="onSubmit(event)"
  >
    <template v-if="builderBlock && builderBlock.children">
      <template :key="index" v-for="(block, index) in builderBlock?.children">
        <builder-block-component :block="block"></builder-block-component>
      </template>
    </template>

    <template v-if="submissionState === 'error'">
      <builder-blocks
        dataPath="errorMessage"
        :blocks="errorMessage"
      ></builder-blocks>
    </template>

    <template v-if="submissionState === 'sending'">
      <builder-blocks
        dataPath="sendingMessage"
        :blocks="sendingMessage"
      ></builder-blocks>
    </template>

    <template v-if="submissionState === 'error' && responseData">
      <pre class="builder-form-error-text pre-2753iz9k9n3">
        {{ JSON.stringify(responseData, null, 2) }}
      </pre>
    </template>

    <template v-if="submissionState === 'success'">
      <builder-blocks
        dataPath="successMessage"
        :blocks="successMessage"
      ></builder-blocks>
    </template>
  </form>
</template>
<script>
import { BuilderBlockComponent as BuilderBlock } from "@dummy";
import { Builder, builder } from "@builder.io/sdk";
import { BuilderBlocks } from "@dummy";
import { set } from "@dummy";
import { get } from "@dummy";

export default {
  name: "form-component",
  components: {
    "builder-block-component": async () => BuilderBlockComponent,
    "builder-blocks": async () => BuilderBlocks,
  },
  props: [
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
    "errorMessage",
    "sendingMessage",
    "successMessage",
  ],

  data: () => ({
    state: "unsubmitted",
    responseData: null,
    formErrorMessage: "",
    BuilderBlock,
  }),

  computed: {
    submissionState() {
      return (Builder.isEditing && this.previewState) || this.state;
    },
  },

  methods: {
    onSubmit(event) {
      const sendWithJs = this.sendWithJs || this.sendSubmissionsTo === "email";

      if (this.sendSubmissionsTo === "zapier") {
        event.preventDefault();
      } else if (sendWithJs) {
        if (!(this.action || this.sendSubmissionsTo === "email")) {
          event.preventDefault();
          return;
        }

        event.preventDefault();
        const el = event.currentTarget;
        const headers = this.customHeaders || {};
        let body;
        const formData = new FormData(el); // TODO: maybe support null

        const formPairs = Array.from(
          event.currentTarget.querySelectorAll("input,select,textarea")
        )
          .filter((el) => !!el.name)
          .map((el) => {
            let value;
            const key = el.name;

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
              value = el.value;
            }

            return {
              key,
              value,
            };
          });
        let contentType = this.contentType;

        if (this.sendSubmissionsTo === "email") {
          contentType = "multipart/form-data";
        }

        Array.from(formPairs).forEach(({ value }) => {
          if (
            value instanceof File ||
            (Array.isArray(value) && value[0] instanceof File) ||
            value instanceof FileList
          ) {
            contentType = "multipart/form-data";
          }
        }); // TODO: send as urlEncoded or multipart by default
        // because of ease of use and reliability in browser API
        // for encoding the form?

        if (contentType !== "application/json") {
          body = formData;
        } else {
          // Json
          const json = {};
          Array.from(formPairs).forEach(({ value, key }) => {
            set(json, key, value);
          });
          body = JSON.stringify(json);
        }

        if (contentType && contentType !== "multipart/form-data") {
          if (
            /* Zapier doesn't allow content-type header to be sent from browsers */
            !(sendWithJs && this.action?.includes("zapier.com"))
          ) {
            headers["content-type"] = contentType;
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

        this.state = "sending";
        const formUrl = `${
          builder.env === "dev" ? "http://localhost:5000" : "https://builder.io"
        }/api/v1/form-submit?apiKey=${builder.apiKey}&to=${btoa(
          this.sendSubmissionsToEmail || ""
        )}&name=${encodeURIComponent(this.name || "")}`;
        fetch(
          this.sendSubmissionsTo === "email" ? formUrl : this.action,
          /* TODO: throw error if no action URL */
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
              }
            }

            this.responseData = body;
            this.state = res.ok ? "success" : "error";

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
            this.state = "error";
          }
        );
      }
    },
  },
};
</script>
<style scoped>
.pre-2753iz9k9n3 {
  padding: 10px;
  color: red;
  text-align: center;
}
</style>
