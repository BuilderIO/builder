'use client';
import * as React from "react";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/* eslint-disable */

/**
 * This import is used by the Svelte SDK. Do not remove.
 */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
/**
 * This component was copied over from the old SDKs and has a lot of code pointing to invalid functions/env vars. It needs
 * to be cleaned up before the component can actually be usable.
 */
interface BuilderElement {}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/* eslint-disable */

/**
 * This import is used by the Svelte SDK. Do not remove.
 */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
/**
 * This component was copied over from the old SDKs and has a lot of code pointing to invalid functions/env vars. It needs
 * to be cleaned up before the component can actually be usable.
 */
export interface FormProps {
  attributes?: any;
  name?: string;
  action?: string;
  validate?: boolean;
  method?: string;
  builderBlock?: BuilderElement;
  sendSubmissionsTo?: string;
  sendSubmissionsToEmail?: string;
  sendWithJs?: boolean;
  contentType?: string;
  customHeaders?: {
    [key: string]: string;
  };
  successUrl?: string;
  previewState?: FormState;
  successMessage?: BuilderElement[];
  errorMessage?: BuilderElement[];
  sendingMessage?: BuilderElement[];
  resetFormOnSubmit?: boolean;
  errorMessagePath?: string;
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/* eslint-disable */

/**
 * This import is used by the Svelte SDK. Do not remove.
 */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
/**
 * This component was copied over from the old SDKs and has a lot of code pointing to invalid functions/env vars. It needs
 * to be cleaned up before the component can actually be usable.
 */
export type FormState = "unsubmitted" | "sending" | "success" | "error";
import Block from "../../components/block/block";
import BuilderBlocks from "../../components/blocks/blocks";
import { isEditing } from "../../functions/is-editing";
import { filterAttrs } from "../helpers";
import { setAttrs } from "../helpers";

function FormComponent(props: FormProps) {
  const _context = { ...props["_context"] };

  const state = {
    formState: "unsubmitted",
    responseData: null,
    formErrorMessage: "",
    get submissionState() {
      return (isEditing() && props.previewState) || state.formState;
    },
    onSubmit(
      event: Event & {
        currentTarget: HTMLFormElement;
      }
    ) {
      const sendWithJs =
        props.sendWithJs || props.sendSubmissionsTo === "email";
      if (props.sendSubmissionsTo === "zapier") {
        event.preventDefault();
      } else if (sendWithJs) {
        if (!(props.action || props.sendSubmissionsTo === "email")) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        const el = event.currentTarget;
        const headers = props.customHeaders || {};
        let body: any;
        const formData = new FormData(el);

        // TODO: maybe support null
        const formPairs: {
          key: string;
          value: File | boolean | number | string | FileList;
        }[] = Array.from(
          event.currentTarget.querySelectorAll("input,select,textarea")
        )
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
        let contentType = props.contentType;
        if (props.sendSubmissionsTo === "email") {
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
        });

        // TODO: send as urlEncoded or multipart by default
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
            /* Zapier doesn't allow content-type header to be sent from browsers */ !(
              sendWithJs && props.action?.includes("zapier.com")
            )
          ) {
            headers["content-type"] = contentType;
          }
        }
        const presubmitEvent = new CustomEvent("presubmit", {
          detail: { body },
        });
        if (formRef) {
          formRef.dispatchEvent(presubmitEvent);
          if (presubmitEvent.defaultPrevented) {
            return;
          }
        }
        state.formState = "sending";
        const formUrl = `${
          builder.env === "dev" ? "http://localhost:5000" : "https://builder.io"
        }/api/v1/form-submit?apiKey=${builder.apiKey}&to=${btoa(
          props.sendSubmissionsToEmail || ""
        )}&name=${encodeURIComponent(props.name || "")}`;
        fetch(
          props.sendSubmissionsTo === "email"
            ? formUrl
            : props.action! /* TODO: throw error if no action URL */,
          { body, headers, method: props.method || "post" }
        ).then(
          async (res) => {
            let body;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
              body = await res.json();
            } else {
              body = await res.text();
            }
            if (!res.ok && props.errorMessagePath) {
              /* TODO: allow supplying an error formatter function */ let message =
                get(body, props.errorMessagePath);
              if (message) {
                if (typeof message !== "string") {
                  /* TODO: ideally convert json to yaml so it woul dbe like           error: - email has been taken */ message =
                    JSON.stringify(message);
                }
                state.formErrorMessage = message;
              }
            }
            state.responseData = body;
            state.formState = res.ok ? "success" : "error";
            if (res.ok) {
              const submitSuccessEvent = new CustomEvent("submit:success", {
                detail: { res, body },
              });
              if (formRef) {
                formRef.dispatchEvent(submitSuccessEvent);
                if (submitSuccessEvent.defaultPrevented) {
                  return;
                }
                /* TODO: option to turn this on/off? */ if (
                  props.resetFormOnSubmit !== false
                ) {
                  formRef.reset();
                }
              }
              /* TODO: client side route event first that can be preventDefaulted */ if (
                props.successUrl
              ) {
                if (formRef) {
                  const event = new CustomEvent("route", {
                    detail: { url: props.successUrl },
                  });
                  formRef.dispatchEvent(event);
                  if (!event.defaultPrevented) {
                    location.href = props.successUrl;
                  }
                } else {
                  location.href = props.successUrl;
                }
              }
            }
          },
          (err) => {
            const submitErrorEvent = new CustomEvent("submit:error", {
              detail: { error: err },
            });
            if (formRef) {
              formRef.dispatchEvent(submitErrorEvent);
              if (submitErrorEvent.defaultPrevented) {
                return;
              }
            }
            state.responseData = err;
            state.formState = "error";
          }
        );
      }
    },
  };
  const builderContext = _context["BuilderContext"];
  return (
    <>
      {" "}
      <form
        validate={props.validate}
        action={!props.sendWithJs && props.action}
        method={props.method}
        name={props.name}
        {...{}}
        {...props.attributes}
      >
        {" "}
        {props.builderBlock && props.builderBlock.children ? (
          <>
            {props.builderBlock?.children?.map((block) => (
              <Block
                block={block}
                context={builderContext}
                _context={_context}
              />
            ))}
          </>
        ) : null}{" "}
        {state.submissionState === "error" ? (
          <>
            <BuilderBlocks
              dataPath="errorMessage"
              blocks={props.errorMessage!}
              _context={_context}
            />
          </>
        ) : null}{" "}
        {state.submissionState === "sending" ? (
          <>
            <BuilderBlocks
              dataPath="sendingMessage"
              blocks={props.sendingMessage!}
              _context={_context}
            />
          </>
        ) : null}{" "}
        {state.submissionState === "error" && state.responseData ? (
          <>
            <pre className="builder-form-error-text pre-264148ec">
              {" "}
              {JSON.stringify(state.responseData, null, 2)}{" "}
            </pre>
          </>
        ) : null}{" "}
        {state.submissionState === "success" ? (
          <>
            <BuilderBlocks
              dataPath="successMessage"
              blocks={props.successMessage!}
              _context={_context}
            />
          </>
        ) : null}{" "}
      </form>{" "}
      <style>{`.pre-264148ec {   padding: 10px;   color: red;   text-align: center; }`}</style>{" "}
    </>
  );
}
export default FormComponent;
