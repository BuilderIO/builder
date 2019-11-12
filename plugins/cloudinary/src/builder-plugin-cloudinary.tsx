import React from 'react'
import { Builder } from '@builder.io/sdk'

// Move custom editor props
interface Props {
  value?: string
  onChange(newValue: string): void
}

export class CloudinaryImageEditor extends React.Component<Props> {
  render() {
    return (
      <div>
        Hello!
        <input value={this.props.value || ''} onChange={e => this.props.onChange(e.target.value)} />
      </div>
    )
  }
}

Builder.registerEditor({
  name: 'cloudinaryImage',
  component: CloudinaryImageEditor
})

export default CloudinaryImageEditor
