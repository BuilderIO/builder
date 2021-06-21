/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { BuilderBlock as BuilderBlockComponent } from '../../components/builder-block.component';
import { BuilderElement, Builder, builder } from '@builder.io/sdk';
import { BuilderBlocks } from '../../components/builder-blocks.component';
import { BuilderStoreContext } from '../../store/builder-store';
import { set } from '../../functions/set';
import { get } from '../../functions/get';
import { withBuilder } from '../../functions/with-builder';

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
  previewState?: string;
  successMessage?: BuilderElement[];
  errorMessage?: BuilderElement[];
  sendingMessage?: BuilderElement[];
  resetFormOnSubmit?: boolean;
  errorMessagePath?: string;
}

const MULTIPART_CONTENT_TYPE = 'multipart/form-data';
const JSON_CONTENT_TYPE = 'application/json';
const ENCODED_CONTENT_TYPE = 'application/x-www-form-urlencoded';

class FormComponent extends React.Component<FormProps> {
  ref: HTMLFormElement | null = null;

  // TODO: link this state to global state and allow togglign the modes in
  // the style and or data editor. TODO: for now some kind of input for preview state
  // that only impacts in the editor?
  state = {
    state: 'unsubmitted' as 'unsubmitted' | 'sending' | 'success' | 'error',
    // TODO: separate response and error?
    responseData: null as any,
    formErrorMessage: '',
  };

  get submissionState() {
    return (Builder.isEditing && this.props.previewState) || this.state.state;
  }

  render() {
    return (
      // TODO: JS data bindings
      <BuilderStoreContext.Consumer>
        {state => (
          <BuilderStoreContext.Provider
            value={{
              ...state,
              state: {
                ...state.state,
                formErrorMessage: this.state.formErrorMessage,
              },
            }}
          >
            <form
              validate={this.props.validate}
              ref={ref => (this.ref = ref)}
              action={!this.props.sendWithJs && this.props.action}
              method={this.props.method}
              name={this.props.name}
              onSubmit={event => {
                const sendWithJs =
                  this.props.sendWithJs || this.props.sendSubmissionsTo === 'email';
                // TODO: custom validate event that can preventDefault and use ref or event to set
                // invalid message
                if (this.props.sendSubmissionsTo === 'zapier') {
                  event.preventDefault();
                  // TODO: send submission to zapier
                } else if (sendWithJs) {
                  if (!(this.props.action || this.props.sendSubmissionsTo === 'email')) {
                    event.preventDefault();
                    return;
                  }
                  event.preventDefault();

                  // TODO: error and success state
                  const el = event.currentTarget;
                  const headers = this.props.customHeaders || {};

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

                  let contentType = this.props.contentType;

                  if (this.props.sendSubmissionsTo === 'email') {
                    contentType = MULTIPART_CONTENT_TYPE;
                  }

                  Array.from(formPairs).forEach(({ value }) => {
                    if (
                      value instanceof File ||
                      (Array.isArray(value) && value[0] instanceof File) ||
                      value instanceof FileList
                    ) {
                      contentType = MULTIPART_CONTENT_TYPE;
                    }
                  });

                  if (contentType === MULTIPART_CONTENT_TYPE) {
                    body = formData;
                  } else if (contentType === JSON_CONTENT_TYPE) {
                    const json = {};

                    Array.from(formPairs).forEach(({ value, key }) => {
                      set(json, key, value);
                    });

                    body = JSON.stringify(json);
                  } else if (contentType === ENCODED_CONTENT_TYPE) {
                    body = Array.from(formPairs)
                      .map(({ value, key }) => {
                        return (
                          encodeURIComponent(key) +
                          '=' +
                          encodeURIComponent(value as boolean | number | string)
                        );
                      })
                      .join('&');
                  } else {
                    // Unsupported content type
                    console.error('Unsupported content type: ', contentType);
                    return;
                  }

                  if (contentType && contentType !== MULTIPART_CONTENT_TYPE) {
                    if (
                      // Zapier doesn't allow content-type header to be sent from browsers
                      !(sendWithJs && this.props.action?.includes('zapier.com'))
                    ) {
                      headers['content-type'] = contentType;
                    }
                  }

                  const presubmitEvent = new CustomEvent('presubmit', {
                    detail: {
                      body,
                    },
                  });
                  if (this.ref) {
                    this.ref.dispatchEvent(presubmitEvent);
                    if (presubmitEvent.defaultPrevented) {
                      return;
                    }
                  }

                  this.setState({
                    ...this.state,
                    state: 'sending',
                  });

                  const formUrl = `${
                    builder.env === 'dev' ? 'http://localhost:5000' : 'https://builder.io'
                  }/api/v1/form-submit?apiKey=${builder.apiKey}&to=${btoa(
                    this.props.sendSubmissionsToEmail || ''
                  )}&name=${encodeURIComponent(this.props.name || '')}`;

                  fetch(
                    this.props.sendSubmissionsTo === 'email' ? formUrl : this.props.action!, // TODO: throw error if no action URL
                    {
                      body,
                      headers,
                      method: this.props.method || 'post',
                    }
                  ).then(
                    async res => {
                      let body;
                      const contentType = res.headers.get('content-type');
                      if (contentType && contentType.indexOf(JSON_CONTENT_TYPE) !== -1) {
                        body = await res.json();
                      } else {
                        body = await res.text();
                      }

                      if (!res.ok && this.props.errorMessagePath) {
                        // TODO: allow supplying an error formatter function
                        let message = get(body, this.props.errorMessagePath);

                        if (message) {
                          if (typeof message !== 'string') {
                            // TODO: ideally convert json to yaml so it woul dbe like
                            // error: - email has been taken
                            message = JSON.stringify(message);
                          }
                          this.setState({
                            ...this.state,
                            formErrorMessage: message,
                          });
                        }
                      }

                      this.setState({
                        ...this.state,
                        responseData: body,
                        state: res.ok ? 'success' : 'error',
                      });

                      if (res.ok) {
                        // TODO: send submit success event

                        const submitSuccessEvent = new CustomEvent('submit:success', {
                          detail: {
                            res,
                            body,
                          },
                        });
                        if (this.ref) {
                          this.ref.dispatchEvent(submitSuccessEvent);
                          if (submitSuccessEvent.defaultPrevented) {
                            return;
                          }
                          // TODO: option to turn this on/off?
                          if (this.props.resetFormOnSubmit !== false) {
                            this.ref.reset();
                          }
                        }

                        // TODO: client side route event first that can be preventDefaulted
                        if (this.props.successUrl) {
                          if (this.ref) {
                            const event = new CustomEvent('route', {
                              detail: {
                                url: this.props.successUrl,
                              },
                            });
                            this.ref.dispatchEvent(event);
                            if (!event.defaultPrevented) {
                              location.href = this.props.successUrl;
                            }
                          } else {
                            location.href = this.props.successUrl;
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
                      if (this.ref) {
                        this.ref.dispatchEvent(submitErrorEvent);
                        if (submitErrorEvent.defaultPrevented) {
                          return;
                        }
                      }

                      // TODO: send submit error event
                      this.setState({
                        ...this.state,
                        responseData: err,
                        state: 'error',
                      });
                    }
                  );
                }
              }}
              {...this.props.attributes}
            >
              {/* TODO: maybe BuilderBlocks */}
              {this.props.builderBlock &&
                this.props.builderBlock.children &&
                this.props.builderBlock.children.map((block, index) => (
                  <BuilderBlockComponent key={block.id} block={block} />
                ))}

              {this.submissionState === 'error' && (
                <BuilderBlocks dataPath="errorMessage" blocks={this.props.errorMessage!} />
              )}

              {this.submissionState === 'sending' && (
                <BuilderBlocks dataPath="sendingMessage" blocks={this.props.sendingMessage!} />
              )}

              {/* TODO: option to turn this off */}
              {this.submissionState === 'error' && this.state.responseData && (
                // TODO: tag to edit
                <pre
                  className="builder-form-error-text"
                  css={{ padding: 10, color: 'red', textAlign: 'center' }}
                >
                  {JSON.stringify(this.state.responseData, null, 2)}
                </pre>
              )}

              {this.submissionState === 'success' && (
                <BuilderBlocks dataPath="successMessage" blocks={this.props.successMessage!} />
              )}
            </form>
          </BuilderStoreContext.Provider>
        )}
      </BuilderStoreContext.Consumer>
    );
  }
}

export const Form = withBuilder(FormComponent, {
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
      defaultValue: JSON_CONTENT_TYPE,
      advanced: true,
      // TODO: do automatically if file input
      enum: [JSON_CONTENT_TYPE, MULTIPART_CONTENT_TYPE, ENCODED_CONTENT_TYPE],
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
      showIf: options =>
        options.get('sendSubmissionsTo') === 'custom' && options.get('sendWithJs') === true,
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
              // TODO: how pull in API message
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
              // TODO: how pull in API message
              text: '<span>Sending...</span>',
            },
          },
        },
      ],
    },
    {
      name: 'customHeaders',
      type: 'map',
      // TODO: add typings for this property
      ...({
        valueType: {
          type: 'string',
        },
      } as any),
      advanced: true,
      showIf: 'options.get("sendSubmissionsTo") === "custom" && options.get("sendWithJs") === true',
    },
    // TODO: custom headers or any fetch options
    // TODO: json vs serialized (i.e. send on client or not)
    // TODO: success/fail stuff
  ],
  noWrap: true,
  // TODO: defaultChildren with two inputs and submit button
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
