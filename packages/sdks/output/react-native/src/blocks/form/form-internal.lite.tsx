import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useState, useRef } from "react";
import RenderBlock from "../../components/render-block.lite";
import { isEditing } from "../../functions/is-editing";

export default function FormComponent(props) {
  const [formState, setFormState] = useState(() => "unsubmitted");

  const [responseData, setResponseData] = useState(() => null);

  const [formErrorMessage, setFormErrorMessage] = useState(() => "");

  function submissionState() {
    return (isEditing() && props.previewState) || formState;
  }

  function onSubmit(event) {
    const sendWithJs = props.sendWithJs || props.sendSubmissionsTo === "email";

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
          /* Zapier doesn't allow content-type header to be sent from browsers */ !(
            sendWithJs && props.action?.includes("zapier.com")
          )
        ) {
          headers["content-type"] = contentType;
        }
      }
      const presubmitEvent = new CustomEvent("presubmit", { detail: { body } });
      if (formRef.current) {
        formRef.current.dispatchEvent(presubmitEvent);
        if (presubmitEvent.defaultPrevented) {
          return;
        }
      }
      setFormState("sending");
      const formUrl = `${
        builder.env === "dev" ? "http://localhost:5000" : "https://builder.io"
      }/api/v1/form-submit?apiKey=${builder.apiKey}&to=${btoa(
        props.sendSubmissionsToEmail || ""
      )}&name=${encodeURIComponent(props.name || "")}`;
      fetch(
        props.sendSubmissionsTo === "email"
          ? formUrl
          : props.action /* TODO: throw error if no action URL */,
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
                /* TODO: ideally convert json to yaml so it woul dbe like            error: - email has been taken */ message =
                  JSON.stringify(message);
              }
              setFormErrorMessage(message);
            }
          }
          setResponseData(body);
          setFormState(res.ok ? "success" : "error");
          if (res.ok) {
            const submitSuccessEvent = new CustomEvent("submit:success", {
              detail: { res, body },
            });
            if (formRef.current) {
              formRef.current.dispatchEvent(submitSuccessEvent);
              if (submitSuccessEvent.defaultPrevented) {
                return;
              }
              /* TODO: option to turn this on/off? */ if (
                props.resetFormOnSubmit !== false
              ) {
                formRef.current.reset();
              }
            }
            /* TODO: client side route event first that can be preventDefaulted */ if (
              props.successUrl
            ) {
              if (formRef.current) {
                const event = new CustomEvent("route", {
                  detail: { url: props.successUrl },
                });
                formRef.current.dispatchEvent(event);
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
          if (formRef.current) {
            formRef.current.dispatchEvent(submitErrorEvent);
            if (submitErrorEvent.defaultPrevented) {
              return;
            }
          }
          setResponseData(err);
          setFormState("error");
        }
      );
    }
  }
  const formRef = useRef();
  return (
    <View
      {...props.attributes}
      validate={props.validate}
      ref={formRef}
      action={!props.sendWithJs && props.action}
      method={props.method}
      name={props.name}
      onSubmit={(event) => onSubmit(event)}
    >
      {" "}
      {props.builderBlock && props.builderBlock.children ? (
        <>
          {props.builderBlock?.children?.map((block, index) => (
            <RenderBlock block={block} />
          ))}
        </>
      ) : null}{" "}
      {submissionState() === "error" ? (
        <>
          <BuilderBlocks dataPath="errorMessage" blocks={props.errorMessage} />
        </>
      ) : null}{" "}
      {submissionState() === "sending" ? (
        <>
          <BuilderBlocks
            dataPath="sendingMessage"
            blocks={props.sendingMessage}
          />
        </>
      ) : null}{" "}
      {submissionState() === "error" && responseData ? (
        <>
          <View style={styles.view1}>
            {" "}
            <Text>{JSON.stringify(responseData, null, 2)}</Text>{" "}
          </View>
        </>
      ) : null}{" "}
      {submissionState() === "success" ? (
        <>
          <BuilderBlocks
            dataPath="successMessage"
            blocks={props.successMessage}
          />
        </>
      ) : null}{" "}
    </View>
  );
}
const styles = StyleSheet.create({
  view1: { padding: 10, color: "red", textAlign: "center" },
});
