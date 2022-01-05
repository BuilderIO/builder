import React from 'react';
import { withBuilder } from '../functions/with-builder';
import { Link } from '../components/Link';

export interface ButtonProps {
  attributes?: any;
  text?: string;
  link?: string;
  openLinkInNewTab?: boolean;
}

class ButtonComponent extends React.Component<ButtonProps> {
  render() {
    const Tag = this.props.link ? Link : 'span';
    return (
      <Tag
        role="button"
        href={this.props.link}
        target={this.props.openLinkInNewTab ? '_blank' : undefined}
        {...this.props.attributes}
      >
        {this.props.text}
      </Tag>
    );
  }
}

export const Button = withBuilder(ButtonComponent, {
  name: 'Core:Button',
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2F81a15681c3e74df09677dfc57a615b13',
  defaultStyles: {
    // TODO: make min width more intuitive and set one
    appearance: 'none',
    paddingTop: '15px',
    paddingBottom: '15px',
    paddingLeft: '25px',
    paddingRight: '25px',
    backgroundColor: '#000000',
    color: 'white',
    borderRadius: '4px',
    textAlign: 'center',
    cursor: 'pointer',
  },
  inputs: [
    {
      name: 'text',
      type: 'text',
      defaultValue: 'Click me!',
      bubble: true,
    },
    {
      name: 'link',
      type: 'url',
      bubble: true,
    },
    {
      name: 'openLinkInNewTab',
      type: 'boolean',
      defaultValue: false,
      friendlyName: 'Open link in new tab',
    },
  ],
  static: true,
  noWrap: true,
});
