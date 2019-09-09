import React from 'react'
import { BuilderBlock } from '../decorators/builder-block.decorator'
import { BuilderElement, Builder } from '@builder.io/sdk'

interface Props {
  code: string
  builderBlock?: BuilderElement
}

@BuilderBlock({
  name: 'Custom Code',
  inputs: [
    {
      name: 'code',
      type: 'html',
      required: true,
      defaultValue: '<p>Hello there, I am custom HTML code!</p>',
      code: true
    }
  ]
})
export class CustomCode extends React.Component<Props> {
  elementRef: HTMLElement | null = null
  originalRef: HTMLElement | null = null

  scriptsInserted = new Set()
  scriptsRun = new Set()

  firstLoad = true

  replaceNodes = Builder.isBrowser && location.href.includes('builder.customCodeRefs=true')

  constructor(props: Props) {
    super(props)
    if (this.replaceNodes && Builder.isBrowser && this.firstLoad && this.props.builderBlock) {
      console.debug('Replace 1')
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

  componentDidUpdate(prevProps: Props) {
    if (this.props.code !== prevProps.code) {
      this.findAndRunScripts()
    }
  }

  componentDidMount() {
    this.findAndRunScripts()
    if (this.replaceNodes && this.originalRef && this.elementRef) {
      console.debug('Replace 2')
      this.elementRef.insertAdjacentElement('beforebegin', this.originalRef)
      this.elementRef.remove()
      this.elementRef = this.originalRef
      this.originalRef = null
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

  render() {
    // TODO: remove <script> tags for server render (unless has some param to say it's only goingn to be run on server)
    // like embed
    return (
      <div
        ref={ref => (this.elementRef = ref)}
        className="builder-custom-code"
        dangerouslySetInnerHTML={{ __html: this.props.code }}
      />
    )
  }
}
