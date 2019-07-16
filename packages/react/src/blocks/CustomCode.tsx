import React from 'react'
import { BuilderBlock } from '../decorators/builder-block.decorator'

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
export class CustomCode extends React.Component<{ code: string }> {
  elementRef: HTMLElement | null = null

  componentDidMount() {
    if (this.elementRef && typeof window !== 'undefined') {
      const scripts = this.elementRef.getElementsByTagName('script')
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i]
        // Innertext?
        try {
          new Function(script.innerText)()
        } catch (error) {
          console.warn('Builder custom code component error:', error)
        }
      }
    }
  }

  render() {
    return (
      <div
        ref={ref => (this.elementRef = ref)}
        className="builder-custom-code"
        dangerouslySetInnerHTML={{ __html: this.props.code }}
      />
    )
  }
}
