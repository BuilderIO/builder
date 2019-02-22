import React from 'react'
import { BuilderBlock } from '../../decorators/builder-block.decorator'
import { BuilderBlock as BuilderBlockComponent } from '../../components/builder-block.component'
import { BuilderElement, Builder } from '@builder.io/sdk'
import set from 'lodash-es/set'
import { BuilderBlocks } from '../../components/builder-blocks.component'

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
    'https://cdn.builder.codes/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2Fef36d2a846134910b64b88e6d18c5ca5',
  inputs: [
    {
      name: 'sendSubmissionsTo',
      type: 'string',
      // TODO: builder, email
      // Later - more integrations like mailchimp
      enum: ['zapier', 'custom'],
      defaultValue: 'zapier'
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
      advanced: true
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
      name: 'action',
      type: 'string',
      helperText: 'URL to send the form data to',
      showIf: 'options.get("sendSubmissionsTo") === "custom"'
    },
    {
      name: 'method',
      type: 'string',
      advanced: true
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
      advanced: true
    },
    {
      name: 'successUrl',
      type: 'url',
      helperText: 'URL to redirect the user to on form submission success',
      showIf: 'options.get("sendSubmissionsTo") === "custom" && options.get("sendWithJs") === true'
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
      enum: ['unsubmitted', 'success', 'error'],
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
          component: {
            type: 'Text',
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
      advanced: true,
    },
    {
      name: 'errorMessage',
      type: 'uiBlocks',
      hideFromUI: true,
      defaultValue: [
        {
          '@type': '@builder.io/sdk:Element',
          component: {
            type: 'Text',
            options: {
              // TODO: how pull in API message
              text: '<span>Form submission error :( Please check your answers and try again</span>'
            }
          }
        }
      ]
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
          name: 'name',
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
    state: 'unsubmitted' as 'unsubmitted' | 'success' | 'error',
    // TODO: separate response and error?
    respnoseData: null as any
  }

  get submissionState() {
    return (Builder.isEditing && this.props.previewState) || this.state.state
  }

  render() {
    return (
      // TODO: JS data bindings
      <form
      validate={this.props.validate}
        ref={ref => (this.ref = ref)}
        action={this.props.action}
        method={this.props.method}
        name={this.props.name}
        onSubmit={event => {
          if (this.props.sendSubmissionsTo === 'zapier') {
            event.preventDefault()
            // TODO: send submission to zapier
          } else if (this.props.sendWithJs) {
            event.preventDefault()
            // TODO: error and success state
            const el = event.currentTarget
            const headers = this.props.customHeaders || {}

            let body: any

            const formData = new FormData(el)

            // TODO: maybe support null
            const formPairs: {
              key: string
              value: File | boolean | number | string
            }[] = (Array.from(document.querySelectorAll('input,select,textarea')) as HTMLElement[])
              .filter(el => !!(el as HTMLInputElement).name)
              .map(el => {
                let value: any
                const key = (el as HTMLImageElement).name
                if (el instanceof HTMLInputElement) {
                  if (el.type === 'checkbox') {
                    value = el.checked
                  } else if (el.type === 'number' || el.type === 'range') {
                    const num = el.valueAsNumber
                    if (!isNaN(num)) {
                      value = num
                    }
                  } else if (el.type === 'file') {
                    // TODO: one vs multiple files
                    value = el.files
                  } else {
                    value = el.value
                  }
                } else {
                  value = (el as HTMLInputElement).value
                }

                return { key, value }
              })

            let contentType = this.props.contentType

            formPairs.forEach(({ value }) => {
              if (value instanceof File || (Array.isArray(value) && value[0] instanceof File)) {
                contentType = 'multipart/formdata'
              }
            })

            if (contentType === 'application/x-www-form-urlencoded') {
              body = formData
            } else if (contentType === 'multipart/formdata') {
              body = new URLSearchParams()
              formPairs.forEach(({ value, key }) => {
                body.append(key, value)
              })
            } else {
              // Json
              body = {}

              formPairs.forEach(({ value, key }) => {
                set(body, key, value)
              })
            }

            fetch(this.props.action!, {
              body,
              headers,
              method: this.props.method || 'post'
            }).then(
              async res => {
                let body
                const contentType = res.headers.get('content-type')
                if (contentType && contentType.indexOf('application/json') !== -1) {
                  body = await res.json()
                } else {
                  body = await res.text()
                }

                this.setState({
                  ...this.state,
                  responseData: body,
                  state: res.ok ? 'success' : 'error'
                })
                // TODO: client side route event first that can be preventDefaulted
                if (this.props.successUrl) {
                  if (this.ref) {
                    const event = new CustomEvent('route', {
                      detail: {
                        url: this.props.successUrl
                      }
                    })
                    this.ref.dispatchEvent(event)
                    if (!event.defaultPrevented) {
                      location.href = this.props.successUrl
                    }
                  }
                }
              },
              err => {
                this.setState({
                  ...this.state,
                  responseData: err,
                  state: 'error'
                })
              }
            )
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

        {/* TODO: option to turn this off */}
        {this.submissionState === 'error' &&
          this.state.respnoseData && (
            // TODO: tag to edit
            <pre
              className="builder-form-error-text"
              style={{ padding: 10, color: 'red', textAlign: 'center' }}
            >
              {JSON.stringify(this.state.respnoseData, null, 2)}
            </pre>
          )}

        {this.submissionState === 'success' && (
          <BuilderBlocks dataPath="successMessage" blocks={this.props.successMessage!} />
        )}
      </form>
    )
  }
}
