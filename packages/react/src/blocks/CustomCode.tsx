import React from 'react'
import { BuilderElement, Builder } from '@builder.io/sdk'
import { withBuilder } from '../functions/with-builder'

interface Props {
  code: string
  builderBlock?: BuilderElement
  replaceNodes?: boolean
  scriptsClientOnly?: boolean
}

// TODO: settings context to pass this down. do in shopify-specific generated code
const globalReplaceNodes = ({} as { [key: string]: Element }) || null

// TODO: take index into account...
if (Builder.isBrowser && globalReplaceNodes) {
  try {
    // TODO: keep track of indexes for if this is repeated have globalReplaceNodes[key][index]
    Array.from(
      document.querySelectorAll(
        // TODO: always use replace nodes by default for shopify context users
        location.host === 'heybloomwell.com' || location.host === 'superkin.com'
          ? '.builder-custom-code'
          : '.builder-custom-code.replace-nodes'
      )
    ).forEach(el => {
      const parent = el.parentElement
      const id = parent && parent.getAttribute('builder-id')
      if (id) {
        // TODO: keep array of these for lists
        globalReplaceNodes[id] = el
        el.remove()
      }
    })
  } catch (err) {
    console.error('Builder replace nodes error:', err)
  }
}

class CustomCodeComponent extends React.Component<Props> {
  elementRef: Element | null = null
  originalRef: Element | null = null

  scriptsInserted = new Set()
  scriptsRun = new Set()

  firstLoad = true
  replaceNodes: boolean

  constructor(props: Props) {
    super(props)

    this.replaceNodes =
      Builder.isBrowser &&
      (props.replaceNodes || (location.host === 'heybloomwell.com' || location.host === 'superkin.com'))

    if (
      this.replaceNodes &&
      Builder.isBrowser &&
      this.firstLoad &&
      this.props.builderBlock
    ) {
      const id = this.props.builderBlock.id
      if (id && globalReplaceNodes?.[id]) {
        const el = globalReplaceNodes[id]
        this.originalRef = el
        delete globalReplaceNodes[id]
      } else {
        // How do if multiple...
        const existing = document.querySelectorAll(
          `.${this.props.builderBlock.id} .builder-custom-code`
        )
        if (existing.length === 1) {
          const node = existing[0]
          this.originalRef = node as HTMLElement
          this.originalRef.remove()
        }
      }
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.code !== prevProps.code) {
      this.findAndRunScripts()
    }
  }

  componentDidMount() {
    this.firstLoad = false
    this.findAndRunScripts()
    if (
      Builder.isBrowser &&
      this.replaceNodes &&
      this.originalRef &&
      this.elementRef
    ) {
      this.elementRef.appendChild(this.originalRef)
    }
  }

  findAndRunScripts() {
    if (this.elementRef && typeof window !== 'undefined') {
      const scripts = this.elementRef.getElementsByTagName('script')
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i]
        if (script.src) {
          if (this.scriptsInserted.has(script.src)) {
            continue
          }
          this.scriptsInserted.add(script.src)
          const newScript = document.createElement('script')
          newScript.async = true
          newScript.src = script.src
          document.head.appendChild(newScript)
        } else {
          if (this.scriptsRun.has(script.innerText)) {
            continue
          }
          try {
            this.scriptsRun.add(script.innerText)
            new Function(script.innerText)()
          } catch (error) {
            console.warn('Builder custom code component error:', error)
          }
        }
      }
    }
  }

  get code() {
    if (Builder.isServer && this.props.scriptsClientOnly) {
      return (this.props.code || '').replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        ''
      )
    }
    return this.props.code
  }

  render() {
    // TODO: remove <script> tags for server render (unless has some param to say it's only goingn to be run on server)
    // like embed
    return (
      <div
        ref={ref => (this.elementRef = ref)}
        // TODO: add a class when node replaced in (?)
        className={
          'builder-custom-code' +
          (this.props.replaceNodes ? ' replace-nodes' : '')
        }
        {...(!this.replaceNodes && {
          dangerouslySetInnerHTML: { __html: this.code }
        })}
      />
    )
  }
}

export const CustomCode = withBuilder(CustomCodeComponent, {
  name: 'Custom Code',
  static: true,
  inputs: [
    {
      name: 'code',
      type: 'html',
      required: true,
      defaultValue: '<p>Hello there, I am custom HTML code!</p>',
      code: true
    },
    {
      name: 'replaceNodes',
      type: 'boolean',
      helperText: 'Preserve server rendered dom nodes',
      defaultValue: false,
      advanced: true
    },
    {
      name: 'scriptsClientOnly',
      type: 'boolean',
      defaultValue: false,
      // TODO: default true?
      helperText:
        'Only print and run scripts on the client. Important when scripts influence DOM that could be replaced when client loads',
      advanced: true
    }
  ]
})
