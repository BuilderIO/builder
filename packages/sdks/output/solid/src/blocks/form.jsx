import { Show, For } from "solid-js";
import { createMutable } from "solid-js/store";
import { css } from "solid-styled-components";
import RenderBlock from "../components/render-block";
import { isEditing } from "../functions/is-editing";

function FormComponent(props) {
  const state = createMutable({
    formState: "unsubmitted",
    responseData: null,
    formErrorMessage: "",

    get submissionState() {
      return isEditing() && props.previewState || state.formState;
    },

    onSubmit(event) {
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

        const formPairs = Array.from(event.currentTarget.querySelectorAll("input,select,textarea")).filter(el => !!el.name).map(el => {
          let value;
          const key = el.name;

          if (el instanceof HTMLInputElement) {
            if (el.type === "radio") {
              if (el.checked) {
                value = el.name;
                return {
                  key,
                  value
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
            value
          };
        });
        let contentType = props.contentType;

        if (props.sendSubmissionsTo === "email") {
          contentType = "multipart/form-data";
        }

        Array.from(formPairs).forEach(({
          value
        }) => {
          if (value instanceof File || Array.isArray(value) && value[0] instanceof File || value instanceof FileList) {
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
          Array.from(formPairs).forEach(({
            value,
            key
          }) => {
            set(json, key, value);
          });
          body = JSON.stringify(json);
        }

        if (contentType && contentType !== "multipart/form-data") {
          if (
          /* Zapier doesn't allow content-type header to be sent from browsers */
          !(sendWithJs && props.action?.includes("zapier.com"))) {
            headers["content-type"] = contentType;
          }
        }

        const presubmitEvent = new CustomEvent("presubmit", {
          detail: {
            body
          }
        });

        if (formRef) {
          formRef.dispatchEvent(presubmitEvent);

          if (presubmitEvent.defaultPrevented) {
            return;
          }
        }

        state.formState = "sending";
        const formUrl = `${builder.env === "dev" ? "http://localhost:5000" : "https://builder.io"}/api/v1/form-submit?apiKey=${builder.apiKey}&to=${btoa(props.sendSubmissionsToEmail || "")}&name=${encodeURIComponent(props.name || "")}`;
        fetch(props.sendSubmissionsTo === "email" ? formUrl : props.action,
        /* TODO: throw error if no action URL */
        {
          body,
          headers,
          method: props.method || "post"
        }).then(async res => {
          let body;
          const contentType = res.headers.get("content-type");

          if (contentType && contentType.indexOf("application/json") !== -1) {
            body = await res.json();
          } else {
            body = await res.text();
          }

          if (!res.ok && props.errorMessagePath) {
            /* TODO: allow supplying an error formatter function */
            let message = get(body, props.errorMessagePath);

            if (message) {
              if (typeof message !== "string") {
                /* TODO: ideally convert json to yaml so it woul dbe like
                error: - email has been taken */
                message = JSON.stringify(message);
              }

              state.formErrorMessage = message;
            }
          }

          state.responseData = body;
          state.formState = res.ok ? "success" : "error";

          if (res.ok) {
            const submitSuccessEvent = new CustomEvent("submit:success", {
              detail: {
                res,
                body
              }
            });

            if (formRef) {
              formRef.dispatchEvent(submitSuccessEvent);

              if (submitSuccessEvent.defaultPrevented) {
                return;
              }
              /* TODO: option to turn this on/off? */


              if (props.resetFormOnSubmit !== false) {
                formRef.reset();
              }
            }
            /* TODO: client side route event first that can be preventDefaulted */


            if (props.successUrl) {
              if (formRef) {
                const event = new CustomEvent("route", {
                  detail: {
                    url: props.successUrl
                  }
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
        }, err => {
          const submitErrorEvent = new CustomEvent("submit:error", {
            detail: {
              error: err
            }
          });

          if (formRef) {
            formRef.dispatchEvent(submitErrorEvent);

            if (submitErrorEvent.defaultPrevented) {
              return;
            }
          }

          state.responseData = err;
          state.formState = "error";
        });
      }
    }

  });
  const formRef = useRef();
  return <form {...props.attributes} validate={props.validate} ref={formRef} action={!props.sendWithJs && props.action} method={props.method} name={props.name} onSubmit={event => state.onSubmit(event)}>
      <Show when={props.builderBlock && props.builderBlock.children}>
        <For each={props.builderBlock?.children}>
          {(block, _index) => {
          const index = _index();

          return <RenderBlock block={block}></RenderBlock>;
        }}
        </For>
      </Show>
      <Show when={state.submissionState === "error"}>
        <BuilderBlocks dataPath="errorMessage" blocks={props.errorMessage}></BuilderBlocks>
      </Show>
      <Show when={state.submissionState === "sending"}>
        <BuilderBlocks dataPath="sendingMessage" blocks={props.sendingMessage}></BuilderBlocks>
      </Show>
      <Show when={state.submissionState === "error" && state.responseData}>
        <pre class={css({
        padding: "10px",
        color: "red",
        textAlign: "center"
      })}>
          {JSON.stringify(state.responseData, null, 2)}
        </pre>
      </Show>
      <Show when={state.submissionState === "success"}>
        <BuilderBlocks dataPath="successMessage" blocks={props.successMessage}></BuilderBlocks>
      </Show>
    </form>;
}

export default FormComponent;import { registerComponent } from '../functions/register-component';
registerComponent(FormComponent, {name:'Form:Form',builtIn:true,defaults:{responsiveStyles:{large:{marginTop:'15px',paddingBottom:'15px'}}},image:'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2Fef36d2a846134910b64b88e6d18c5ca5',inputs:[{name:'sendSubmissionsTo',type:'string',enum:[{label:'Send to email',value:'email',helperText:'Send form submissions to the email address of your choosing'},{label:'Custom',value:'custom',helperText:'Handle where the form requests go manually with a little code, e.g. to your own custom backend'}],defaultValue:'email'},{name:'sendSubmissionsToEmail',type:'string',required:true,defaultValue:'your@email.com',showIf:'options.get("sendSubmissionsTo") === "email"'},{name:'sendWithJs',type:'boolean',helperText:'Set to false to use basic html form action',defaultValue:true,showIf:'options.get("sendSubmissionsTo") === "custom"'},{name:'name',type:'string',defaultValue:'My form'},{name:'action',type:'string',helperText:'URL to send the form data to',showIf:'options.get("sendSubmissionsTo") === "custom"'},{name:'contentType',type:'string',defaultValue:'application/json',advanced:true,enum:['application/json','multipart/form-data','application/x-www-form-urlencoded'],showIf:'options.get("sendSubmissionsTo") === "custom" && options.get("sendWithJs") === true'},{name:'method',type:'string',showIf:'options.get("sendSubmissionsTo") === "custom"',defaultValue:'POST',advanced:true},{name:'previewState',type:'string',enum:['unsubmitted','sending','success','error'],defaultValue:'unsubmitted',helperText:'Choose a state to edit, e.g. choose "success" to show what users see on success and edit the message',showIf:'options.get("sendSubmissionsTo") !== "zapier" && options.get("sendWithJs") === true'},{name:'successUrl',type:'url',helperText:'Optional URL to redirect the user to on form submission success',showIf:'options.get("sendSubmissionsTo") !== "zapier" && options.get("sendWithJs") === true'},{name:'resetFormOnSubmit',type:'boolean',showIf:"options.get('sendSubmissionsTo') === 'custom' && options.get('sendWithJs') === true",advanced:true},{name:'successMessage',type:'uiBlocks',hideFromUI:true,defaultValue:[{'@type':'@builder.io/sdk:Element',responsiveStyles:{large:{marginTop:'10px'}},component:{name:'Text',options:{text:'<span>Thanks!</span>'}}}]},{name:'validate',type:'boolean',defaultValue:true,advanced:true},{name:'errorMessagePath',type:'text',advanced:true,helperText:'Path to where to get the error message from in a JSON response to display to the user, e.g. "error.message" for a response like { "error": { "message": "this username is taken" }}'},{name:'errorMessage',type:'uiBlocks',hideFromUI:true,defaultValue:[{'@type':'@builder.io/sdk:Element',responsiveStyles:{large:{marginTop:'10px'}},bindings:{'component.options.text':'state.formErrorMessage || block.component.options.text'},component:{name:'Text',options:{text:'<span>Form submission error :( Please check your answers and try again</span>'}}}]},{name:'sendingMessage',type:'uiBlocks',hideFromUI:true,defaultValue:[{'@type':'@builder.io/sdk:Element',responsiveStyles:{large:{marginTop:'10px'}},component:{name:'Text',options:{text:'<span>Sending...</span>'}}}]},{name:'customHeaders',type:'map',valueType:{type:'string'},advanced:true,showIf:'options.get("sendSubmissionsTo") === "custom" && options.get("sendWithJs") === true'}],noWrap:true,canHaveChildren:true,defaultChildren:[{'@type':'@builder.io/sdk:Element',responsiveStyles:{large:{marginTop:'10px'}},component:{name:'Text',options:{text:'<span>Enter your name</span>'}}},{'@type':'@builder.io/sdk:Element',responsiveStyles:{large:{marginTop:'10px'}},component:{name:'Form:Input',options:{name:'name',placeholder:'Jane Doe'}}},{'@type':'@builder.io/sdk:Element',responsiveStyles:{large:{marginTop:'10px'}},component:{name:'Text',options:{text:'<span>Enter your email</span>'}}},{'@type':'@builder.io/sdk:Element',responsiveStyles:{large:{marginTop:'10px'}},component:{name:'Form:Input',options:{name:'email',placeholder:'jane@doe.com'}}},{'@type':'@builder.io/sdk:Element',responsiveStyles:{large:{marginTop:'10px'}},component:{name:'Form:SubmitButton',options:{text:'Submit'}}}]});