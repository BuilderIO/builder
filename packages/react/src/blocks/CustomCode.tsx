import React from 'react'
import { BuilderBlock } from '../decorators/builder-block.decorator'

interface Props {
  code: string
}

@BuilderBlock({
  name: 'Custom Code',
  inputs: [
    {
      name: 'code',
      type: 'longText',
      required: true,
      defaultValue: '<p>Hello there, I am custom HTML code!</p>'
    }
  ]
})
export class CustomCode extends React.Component<Props> {
  elementRef: HTMLElement | null = null

  scriptsInserted = new Set()
  scriptsRun = new Set()

  componentDidUpdate(prevProps: Props) {
    if (this.props.code !== prevProps.code) {
      this.findAndRunScripts()
    }
  }

  componentDidMount() {
    this.findAndRunScripts()
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
