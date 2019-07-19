import React from 'react'
import { BuilderBlock } from '../../decorators/builder-block.decorator'
import { BuilderBlock as BuilderBlockComponent } from '../../components/builder-block.component'
import { BuilderElement, Builder } from '@builder.io/sdk'
import set from 'lodash-es/set'
import get from 'lodash-es/get'
import { BuilderBlocks } from '../../components/builder-blocks.component'
import { BuilderStoreContext } from '../../store/builder-store'
import { View, Text } from 'react-native';

export interface FormProps {
  attributes?: any
  name?: string
  action?: string
  validate?: boolean
  method?: string
  builderBlock?: BuilderElement
  sendSubmissionsTo?: string
  sendWithJs?: boolean
  contentType?: string
  customHeaders?: { [key: string]: string }
  successUrl?: string
  previewState?: string
  successMessage?: BuilderElement[]
  errorMessage?: BuilderElement[]
  sendingMessage?: BuilderElement[]
  resetFormOnSubmit?: boolean
  errorMessagePath?: string
}

@BuilderBlock({
  name: 'Form:Form',
  // editableTags: ['builder-form-error']
  defaults: {
    responsiveStyles: {
      large: {
        marginTop: '15px',
        paddingBottom: '15px'
      }
    }
  },
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2Fef36d2a846134910b64b88e6d18c5ca5',
  inputs: [
    {
      name: 'sendSubmissionsTo',
      type: 'string',
      // TODO: builder, email
      // Later - more integrations like mailchimp
      enum: ['zapier', 'custom'],
      hideFromUI: true,
      defaultValue: 'custom'
    },
    {
      name: 'sendWithJs',
      type: 'boolean',
      helperText: 'Set to false to use basic html form action',
      defaultValue: true,
      showIf: 'options.get("sendSubmissionsTo") === "custom"'
    },
    {
      name: 'name',
      type: 'string',
      showIf: 'options.get("sendSubmissionsTo") === "zapier"'
      // advanced: true
    },
    {
      name: 'action',
      type: 'string',
      helperText: 'URL to send the form data to',
      showIf: 'options.get("sendSubmissionsTo") === "custom"'
    },
    {
      name: 'contentType',
      type: 'string',
      defaultValue: 'application/json',
      advanced: true,
      // TODO: do automatically if file input
      enum: ['application/json', 'multipart/formdata', 'application/x-www-form-urlencoded'],
      showIf: 'options.get("sendSubmissionsTo") === "custom" && options.get("sendWithJs") === true'
    },
    {
      name: 'method',
      type: 'string',
      showIf: 'options.get("sendSubmissionsTo") === "custom"',
      advanced: true
    },
    {
      name: 'successUrl',
      type: 'url',
      helperText: 'Optional URL to redirect the user to on form submission success',
      showIf: 'options.get("sendSubmissionsTo") === "custom" && options.get("sendWithJs") === true'
    },
    {
      name: 'resetFormOnSubmit',
      type: 'boolean',
      showIf: options =>
        options.get('sendSubmissionsTo') === 'custom' && options.get('sendWithJs') === true,
      advanced: true
    },
    // TODO: maybe
    // {
    //   name: 'apiErrorMessageField',
    //   type: 'text',
    //   helperText: 'URL to redirect the user to on form submission success',
    //   showIf: 'options.get("sendSubmissionsTo") === "custom" && options.get("sendWithJs") === true'
    // },
    {
      // editState?
      name: 'previewState',
      type: 'string',
      enum: ['unsubmitted', 'sending', 'success', 'error'],
      helperText:
        'Choose a state to edit, e.g. choose "success" to show what users see on success and edit the message',
      showIf: 'options.get("sendSubmissionsTo") === "custom" && options.get("sendWithJs") === true'
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
            }
          },
          component: {
            name: 'Text',
            options: {
              text: '<span>Thanks!</span>'
            }
          }
        }
      ]
    },
    {
      name: 'validate',
      type: 'boolean',
      defaultValue: true,
      advanced: true
    },
    {
      name: 'errorMessagePath',
      type: 'text',
      advanced: true,
      helperText:
        'Path to where to get the error message from in a JSON response to display to the user, e.g. "error.message" for a response like { "error": { "message": "this username is taken" }}'
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
            }
          },
          bindings: {
            'component.options.text': 'state.formErrorMessage || block.component.options.text'
          },
          component: {
            name: 'Text',
            options: {
              // TODO: how pull in API message
              text: '<span>Form submission error :( Please check your answers and try again</span>'
            }
          }
        }
      ]
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
            }
          },
          component: {
            name: 'Text',
            options: {
              // TODO: how pull in API message
              text: '<span>Sending...</span>'
            }
          }
        }
      ]
    },
    {
      name: 'customHeaders',
      type: 'map',
      // TODO: add typings for this property
      ...({
        valueType: {
          type: 'string'
        }
      } as any),
      advanced: true,
      showIf: 'options.get("sendSubmissionsTo") === "custom" && options.get("sendWithJs") === true'
    }
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
          marginTop: '10px'
        }
      },
      component: {
        name: 'Text',
        options: {
          text: '<span>Enter your name</span>'
        }
      }
    },
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          marginTop: '10px'
        }
      },
      component: {
        name: 'Form:Input',
        options: {
          name: 'name',
          placeholder: 'Jane Doe'
        }
      }
    },
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          marginTop: '10px'
        }
      },
      component: {
        name: 'Text',
        options: {
          text: '<span>Enter your email</span>'
        }
      }
    },
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          marginTop: '10px'
        }
      },
      component: {
        name: 'Form:Input',
        options: {
          name: 'email',
          placeholder: 'jane@doe.com'
        }
      }
    },
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          marginTop: '10px'
        }
      },
      component: {
        name: 'Form:SubmitButton',
        options: {
          text: 'Submit'
        }
      }
    }
  ]
})
export class Form extends React.Component<FormProps> {
  ref: HTMLFormElement | null = null

  // TODO: link this state to global state and allow togglign the modes in
  // the style and or data editor. TODO: for now some kind of input for preview state
  // that only impacts in the editor?
  state = {
    state: 'unsubmitted' as 'unsubmitted' | 'sending' | 'success' | 'error',
    // TODO: separate response and error?
    respnoseData: null as any,
    formErrorMessage: ''
  }

  get submissionState() {
    return (Builder.isEditing && this.props.previewState) || this.state.state
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
                formErrorMessage: this.state.formErrorMessage
              }
            }}
          >
            <View
              // validate={this.props.validate}
              // ref={ref => (this.ref = ref)}
              action={!this.props.sendWithJs && this.props.action}
              method={this.props.method}
              name={this.props.name}
              // TODO: Need to handle this myself...
              // onSubmit={event => {
              //   // TODO: custom validate event that can preventDefault and use ref or event to set
              //   // invalid message
              //   if (this.props.sendSubmissionsTo === 'zapier') {
              //     event.preventDefault()
              //     // TODO: send submission to zapier
              //   } else if (this.props.sendWithJs) {
              //     event.preventDefault()
              //     // TODO: error and success state
              //     const el = event.currentTarget
              //     const headers = this.props.customHeaders || {}

              //     let body: any

              //     const formData = new FormData(el)

              //     // TODO: maybe support null
              //     const formPairs: {
              //       key: string
              //       value: File | boolean | number | string
              //     }[] = (Array.from(
              //       event.currentTarget.querySelectorAll('input,select,textarea')
              //     ) as HTMLElement[])
              //       .filter(el => !!(el as HTMLInputElement).name)
              //       .map(el => {
              //         let value: any
              //         const key = (el as HTMLImageElement).name
              //         if (el instanceof HTMLInputElement) {
              //           if (el.type === 'radio') {
              //             if (el.checked) {
              //               value = el.name
              //               return { key, value }
              //             }
              //           } else if (el.type === 'checkbox') {
              //             value = el.checked
              //           } else if (el.type === 'number' || el.type === 'range') {
              //             const num = el.valueAsNumber
              //             if (!isNaN(num)) {
              //               value = num
              //             }
              //           } else if (el.type === 'file') {
              //             // TODO: one vs multiple files
              //             value = el.files
              //           } else {
              //             value = el.value
              //           }
              //         } else {
              //           value = (el as HTMLInputElement).value
              //         }

              //         return { key, value }
              //       })

              //     let contentType = this.props.contentType

              //     formPairs.forEach(({ value }) => {
              //       if (
              //         value instanceof File ||
              //         (Array.isArray(value) && value[0] instanceof File)
              //       ) {
              //         contentType = 'multipart/formdata'
              //       }
              //     })

              //     if (contentType === 'application/x-www-form-urlencoded') {
              //       body = formData
              //     } else if (contentType === 'multipart/formdata') {
              //       body = new URLSearchParams()
              //       formPairs.forEach(({ value, key }) => {
              //         body.append(key, value)
              //       })
              //     } else {
              //       // Json
              //       const json = {}

              //       formPairs.forEach(({ value, key }) => {
              //         set(json, key, value)
              //       })

              //       body = JSON.stringify(json)
              //     }

              //     const presubmitEvent = new CustomEvent('presubmit', {
              //       detail: {
              //         body
              //       }
              //     })
              //     if (this.ref) {
              //       this.ref.dispatchEvent(presubmitEvent)
              //       if (presubmitEvent.defaultPrevented) {
              //         return
              //       }
              //     }

              //     this.setState({
              //       ...this.state,
              //       state: 'sending'
              //     })

              //     fetch(this.props.action!, {
              //       body,
              //       headers,
              //       method: this.props.method || 'post'
              //     }).then(
              //       async res => {
              //         let body
              //         const contentType = res.headers.get('content-type')
              //         if (contentType && contentType.indexOf('application/json') !== -1) {
              //           body = await res.json()
              //         } else {
              //           body = await res.text()
              //         }

              //         if (!res.ok && this.props.errorMessagePath) {
              //           // TODO: allow supplying an error formatter function
              //           let message = get(body, this.props.errorMessagePath)

              //           if (message) {
              //             if (typeof message !== 'string') {
              //               // TODO: ideally convert json to yaml so it woul dbe like
              //               // error: - email has been taken
              //               message = JSON.stringify(message)
              //             }
              //             this.setState({
              //               ...this.state,
              //               formErrorMessage: message
              //             })
              //           }
              //         }

              //         this.setState({
              //           ...this.state,
              //           responseData: body,
              //           state: res.ok ? 'success' : 'error'
              //         })

              //         if (res.ok) {
              //           // TODO: send submit success event

              //           const submitSuccessEvent = new CustomEvent('submit:success', {
              //             detail: {
              //               res,
              //               body
              //             }
              //           })
              //           if (this.ref) {
              //             this.ref.dispatchEvent(submitSuccessEvent)
              //             if (submitSuccessEvent.defaultPrevented) {
              //               return
              //             }
              //             // TODO: option to turn this on/off?
              //             if (this.props.resetFormOnSubmit !== false) {
              //               this.ref.reset()
              //             }
              //           }

              //           // TODO: client side route event first that can be preventDefaulted
              //           if (this.props.successUrl) {
              //             if (this.ref) {
              //               const event = new CustomEvent('route', {
              //                 detail: {
              //                   url: this.props.successUrl
              //                 }
              //               })
              //               this.ref.dispatchEvent(event)
              //               if (!event.defaultPrevented) {
              //                 location.href = this.props.successUrl
              //               }
              //             } else {
              //               location.href = this.props.successUrl
              //             }
              //           }
              //         }
              //       },
              //       err => {
              //         const submitErrorEvent = new CustomEvent('submit:error', {
              //           detail: {
              //             error: err
              //           }
              //         })
              //         if (this.ref) {
              //           this.ref.dispatchEvent(submitErrorEvent)
              //           if (submitErrorEvent.defaultPrevented) {
              //             return
              //           }
              //         }

              //         // TODO: send submit error event
              //         this.setState({
              //           ...this.state,
              //           responseData: err,
              //           state: 'error'
              //         })
              //       }
              //     )
              //   }
              // }}
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
              {this.submissionState === 'error' && this.state.respnoseData && (
                // TODO: tag to edit
                <Text
                  // className="builder-form-error-text"
                  style={{ padding: 10, color: 'red', textAlign: 'center' }}
                >
                  {JSON.stringify(this.state.respnoseData, null, 2)}
                </Text>
              )}

              {this.submissionState === 'success' && (
                <BuilderBlocks dataPath="successMessage" blocks={this.props.successMessage!} />
              )}
            </View>
          </BuilderStoreContext.Provider>
        )}
      </BuilderStoreContext.Consumer>
    )
  }
}
