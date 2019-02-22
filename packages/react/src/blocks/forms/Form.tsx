import React from 'react'
import { BuilderBlock } from '../../decorators/builder-block.decorator'
import { BuilderBlock as BuilderBlockComponent } from '../../components/builder-block.component'
import { BuilderElement } from '@builder.io/sdk'

export interface FormProps {
  attributes?: any
  name?: string
  action?: string
  method?: string
  builderBlock?: BuilderElement
  sendSubmissionsTo?: string
  sendWithJs?: boolean
  contentType?: string
}

@BuilderBlock({
  name: 'Form:Form',
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
      // TODO: more info
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
      defaultValue: 'json',
      enum: ['json', 'formdata'],
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
  render() {
    return (
      // TODO: JS data bindings
      <form
        action={this.props.action}
        method={this.props.method}
        name={this.props.name}
        onSubmit={evenb => {
          if (this.props.sendSubmissionsTo === 'zapier') {
            // event.preventDefault();
            // TODO: send submission to zapier
          } else if (this.props.sendWithJs) {
            // TODO: handle the JS with the options above
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
      </form>
    )
  }
}
