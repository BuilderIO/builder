import React from 'react'

import { BuilderBlock } from '../decorators/builder-block.decorator'

@BuilderBlock({
  name: 'Button',
  inputs: [
    { name: 'text', type: 'string', defaultValue: 'Click me' },
    { name: 'link', type: 'url', required: true },
    {
      name: 'position',
      type: 'string',
      enum: ['left', 'center', 'right', 'stretch'],
      defaultValue: 'center'
    },
    { name: 'color', type: 'color', defaultValue: '#000000' },
    { name: 'textColor', type: 'color', defaultValue: '#ffffff' },
    { name: 'size', type: 'number', defaultValue: 15 },
    { name: 'corners', type: 'number', defaultValue: 4, hideFromUI: true }
  ]
})
export class Button extends React.Component<any> {
  private get positionToAlign() {
    switch (this.props.position) {
      case 'left':
        return 'flex-start'
      case 'right':
        return 'flex-end'
      default:
        return this.props.position || 'center'
    }
  }

  render() {
    return (
      <a
        style={{
          padding: `${this.props.size}px ${this.props.size * 1.5}px`,
          fontSize: this.props.size,
          color: this.props.textColor,
          backgroundColor: this.props.color,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: this.positionToAlign,
          borderRadius: this.props.corners,
          textDecoration: 'none'
        }}
        href={this.props.link}
      >
        {this.props.text}
      </a>
    )
  }
}
