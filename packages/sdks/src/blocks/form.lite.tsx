import { useState, useRef, Show, For } from '@builder.io/mitosis';
import { BuilderBlock as BuilderBlockComponent } from '@dummy';
import { BuilderElement, Builder, builder } from '@builder.io/sdk';
import { BuilderBlocks } from '@dummy';
import { set } from '@dummy';
import { get } from '@dummy';
import { registerComponent } from '../functions/register-component';

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
  customHeaders?: { [key: string]: string };
  successUrl?: string;
  previewState?: FormState;
  successMessage?: BuilderElement[];
  errorMessage?: BuilderElement[];
  sendingMessage?: BuilderElement[];
  resetFormOnSubmit?: boolean;
  errorMessagePath?: string;
}

export type FormState = 'unsubmitted' | 'sending' | 'success' | 'error';

export default function FormComponent(props: FormProps) {
  const state = useState({
    state: 'unsubmitted' as FormState,
    // TODO: separate response and error?
    responseData: null as any,
    formErrorMessage: '',
    get submissionState(): FormState {
      return (Builder.isEditing && props.previewState) || state.state;
    },
    onSubmit(event: Event & { currentTarget: HTMLFormElement }) {
      const sendWithJs = props.sendWithJs || props.sendSubmissionsTo === 'email';

      if (props.sendSubmissionsTo === 'zapier') {
        event.preventDefault();
      } else if (sendWithJs) {
        if (!(props.action || props.sendSubmissionsTo === 'email')) {
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
        }[] = Array.from(event.currentTarget.querySelectorAll('input,select,textarea'))
          .filter(el => !!(el as HTMLInputElement).name)
          .map(el => {
            let value: any;
            const key = (el as HTMLImageElement).name;
            if (el instanceof HTMLInputElement) {
              if (el.type === 'radio') {
                if (el.checked) {
                  value = el.name;
                  return { key, value };
                }
              } else if (el.type === 'checkbox') {
                value = el.checked;
              } else if (el.type === 'number' || el.type === 'range') {
                const num = el.valueAsNumber;
                if (!isNaN(num)) {
                  value = num;
                }
              } else if (el.type === 'file') {
                // TODO: one vs multiple files
                value = el.files;
              } else {
                value = el.value;
              }
            } else {
              value = (el as HTMLInputElement).value;
            }

            return { key, value };
          });

        let contentType = props.contentType;

        if (props.sendSubmissionsTo === 'email') {
          contentType = 'multipart/form-data';
        }

        Array.from(formPairs).forEach(({ value }) => {
          if (
            value instanceof File ||
            (Array.isArray(value) && value[0] instanceof File) ||
            value instanceof FileList
          ) {
            contentType = 'multipart/form-data';
          }
        });

        // TODO: send as urlEncoded or multipart by default
        // because of ease of use and reliability in browser API
        // for encoding the form?
        if (contentType !== 'application/json') {
          body = formData;
        } else {
          // Json
          const json = {};

          Array.from(formPairs).forEach(({ value, key }) => {
            set(json, key, value);
          });

          body = JSON.stringify(json);
        }

        if (contentType && contentType !== 'multipart/form-data') {
          if (
            /* Zapier doesn't allow content-type header to be sent from browsers */
            !(sendWithJs && props.action?.includes('zapier.com'))
          ) {
            headers['content-type'] = contentType;
          }
        }

        const presubmitEvent = new CustomEvent('presubmit', {
          detail: {
            body,
          },
        });
        if (formRef) {
          formRef.dispatchEvent(presubmitEvent);
          if (presubmitEvent.defaultPrevented) {
            return;
          }
        }

        state.state = 'sending';

        const formUrl = `${
          builder.env === 'dev' ? 'http://localhost:5000' : 'https://builder.io'
        }/api/v1/form-submit?apiKey=${builder.apiKey}&to=${btoa(
          props.sendSubmissionsToEmail || ''
        )}&name=${encodeURIComponent(props.name || '')}`;

        fetch(
          props.sendSubmissionsTo === 'email'
            ? formUrl
            : props.action! /* TODO: throw error if no action URL */,
          {
            body,
            headers,
            method: props.method || 'post',
          }
        ).then(
          async res => {
            let body;
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.indexOf('application/json') !== -1) {
              body = await res.json();
            } else {
              body = await res.text();
            }

            if (!res.ok && props.errorMessagePath) {
              /* TODO: allow supplying an error formatter function */
              let message = get(body, props.errorMessagePath);

              if (message) {
                if (typeof message !== 'string') {
                  /* TODO: ideally convert json to yaml so it woul dbe like
                   error: - email has been taken */
                  message = JSON.stringify(message);
                }
                state.formErrorMessage = message;
              }
            }

            state.responseData = body;
            state.state = res.ok ? 'success' : 'error';

            if (res.ok) {
              const submitSuccessEvent = new CustomEvent('submit:success', {
                detail: {
                  res,
                  body,
                },
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
                  const event = new CustomEvent('route', {
                    detail: {
                      url: props.successUrl,
                    },
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
          err => {
            const submitErrorEvent = new CustomEvent('submit:error', {
              detail: {
                error: err,
              },
            });
            if (formRef) {
              formRef.dispatchEvent(submitErrorEvent);
              if (submitErrorEvent.defaultPrevented) {
                return;
              }
            }

            state.responseData = err;
            state.state = 'error';
          }
        );
      }
    },
  });

  const formRef = useRef();

  return (
    <form
      validate={props.validate}
      ref={formRef}
      action={!props.sendWithJs && props.action}
      method={props.method}
      name={props.name}
      onSubmit={event => state.onSubmit(event)}
      {...props.attributes}
    >
      <Show when={props.builderBlock && props.builderBlock.children}>
        <For each={props.builderBlock?.children}>
          {block => <BuilderBlockComponent block={block} />}
        </For>
      </Show>

      <Show when={state.submissionState === 'error'}>
        <BuilderBlocks dataPath="errorMessage" blocks={props.errorMessage!} />
      </Show>

      <Show when={state.submissionState === 'sending'}>
        <BuilderBlocks dataPath="sendingMessage" blocks={props.sendingMessage!} />
      </Show>

      <Show when={state.submissionState === 'error' && state.responseData}>
        <pre
          class="builder-form-error-text"
          css={{ padding: '10px', color: 'red', textAlign: 'center' }}
        >
          {JSON.stringify(state.responseData, null, 2)}
        </pre>
      </Show>

      <Show when={state.submissionState === 'success'}>
        <BuilderBlocks dataPath="successMessage" blocks={props.successMessage!} />
      </Show>
    </form>
  );
}

registerComponent({
  name: 'Form:Form',
  // editableTags: ['builder-form-error']
  defaults: {
    responsiveStyles: {
      large: {
        marginTop: '15px',
        paddingBottom: '15px',
      },
    },
  },
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2Fef36d2a846134910b64b88e6d18c5ca5',
  inputs: [
    {
      name: 'sendSubmissionsTo',
      type: 'string',
      // TODO: save to builder data and user can download as csv
      // TODO: easy for mode too or computed add/remove fields form mode
      // so you can edit details and high level mode at same time...
      // Later - more integrations like mailchimp
      // /api/v1/form-submit?to=mailchimp
      enum: [
        {
          label: 'Send to email',
          value: 'email',
          helperText: 'Send form submissions to the email address of your choosing',
        },
        {
          label: 'Custom',
          value: 'custom',
          helperText:
            'Handle where the form requests go manually with a little code, e.g. to your own custom backend',
        },
      ],
      defaultValue: 'email',
    },
    {
      name: 'sendSubmissionsToEmail',
      type: 'string',
      required: true, // TODO: required: () => options.get("sendSubmissionsTo") === "email"
      defaultValue: 'your@email.com',
      showIf: 'options.get("sendSubmissionsTo") === "email"',
    },
    {
      name: 'sendWithJs',
      type: 'boolean',
      helperText: 'Set to false to use basic html form action',
      defaultValue: true,
      showIf: 'options.get("sendSubmissionsTo") === "custom"',
    },
    {
      name: 'name',
      type: 'string',
      defaultValue: 'My form',
      // advanced: true
    },
    {
      name: 'action',
      type: 'string',
      helperText: 'URL to send the form data to',
      showIf: 'options.get("sendSubmissionsTo") === "custom"',
    },
    {
      name: 'contentType',
      type: 'string',
      defaultValue: 'application/json',
      advanced: true,
      // TODO: do automatically if file input
      enum: ['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded'],
      showIf: 'options.get("sendSubmissionsTo") === "custom" && options.get("sendWithJs") === true',
    },
    {
      name: 'method',
      type: 'string',
      showIf: 'options.get("sendSubmissionsTo") === "custom"',
      defaultValue: 'POST',
      advanced: true,
    },
    {
      name: 'previewState',
      type: 'string',
      // TODO: persist: false flag
      enum: ['unsubmitted', 'sending', 'success', 'error'],
      defaultValue: 'unsubmitted',
      helperText:
        'Choose a state to edit, e.g. choose "success" to show what users see on success and edit the message',
      showIf: 'options.get("sendSubmissionsTo") !== "zapier" && options.get("sendWithJs") === true',
    },
    {
      name: 'successUrl',
      type: 'url',
      helperText: 'Optional URL to redirect the user to on form submission success',
      showIf: 'options.get("sendSubmissionsTo") !== "zapier" && options.get("sendWithJs") === true',
    },
    {
      name: 'resetFormOnSubmit',
      type: 'boolean',
      showIf: "options.get('sendSubmissionsTo') === 'custom' && options.get('sendWithJs') === true",
      advanced: true,
    },
    {
      name: 'successMessage',
      type: 'uiBlocks',
      hideFromUI: true,
      defaultValue: [
        {
          '@type': '@builder.io/sdk:Element',
          responsiveStyles: {
            large: {
              marginTop: '10px',
            },
          },
          component: {
            name: 'Text',
            options: {
              text: '<span>Thanks!</span>',
            },
          },
        },
      ],
    },
    {
      name: 'validate',
      type: 'boolean',
      defaultValue: true,
      advanced: true,
    },
    {
      name: 'errorMessagePath',
      type: 'text',
      advanced: true,
      helperText:
        'Path to where to get the error message from in a JSON response to display to the user, e.g. "error.message" for a response like { "error": { "message": "this username is taken" }}',
    },
    {
      name: 'errorMessage',
      type: 'uiBlocks',
      hideFromUI: true,
      defaultValue: [
        {
          '@type': '@builder.io/sdk:Element',
          responsiveStyles: {
            large: {
              marginTop: '10px',
            },
          },
          bindings: {
            'component.options.text': 'state.formErrorMessage || block.component.options.text',
          },
          component: {
            name: 'Text',
            options: {
              text: '<span>Form submission error :( Please check your answers and try again</span>',
            },
          },
        },
      ],
    },
    {
      name: 'sendingMessage',
      type: 'uiBlocks',
      hideFromUI: true,
      defaultValue: [
        {
          '@type': '@builder.io/sdk:Element',
          responsiveStyles: {
            large: {
              marginTop: '10px',
            },
          },
          component: {
            name: 'Text',
            options: {
              text: '<span>Sending...</span>',
            },
          },
        },
      ],
    },
    {
      name: 'customHeaders',
      type: 'map',
      valueType: {
        type: 'string',
      },
      advanced: true,
      showIf: 'options.get("sendSubmissionsTo") === "custom" && options.get("sendWithJs") === true',
    },
  ],
  noWrap: true,
  canHaveChildren: true,
  defaultChildren: [
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          marginTop: '10px',
        },
      },
      component: {
        name: 'Text',
        options: {
          text: '<span>Enter your name</span>',
        },
      },
    },
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          marginTop: '10px',
        },
      },
      component: {
        name: 'Form:Input',
        options: {
          name: 'name',
          placeholder: 'Jane Doe',
        },
      },
    },
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          marginTop: '10px',
        },
      },
      component: {
        name: 'Text',
        options: {
          text: '<span>Enter your email</span>',
        },
      },
    },
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          marginTop: '10px',
        },
      },
      component: {
        name: 'Form:Input',
        options: {
          name: 'email',
          placeholder: 'jane@doe.com',
        },
      },
    },
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          marginTop: '10px',
        },
      },
      component: {
        name: 'Form:SubmitButton',
        options: {
          text: 'Submit',
        },
      },
    },
  ],
});
