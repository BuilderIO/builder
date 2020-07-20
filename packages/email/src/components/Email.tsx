import { BuilderBlock, BuilderBlocks } from '@builder.io/react';
import React from 'react';
import { resetStyles } from '../constants/reset-styles';

interface EmailProps {
  title?: string;
}

@BuilderBlock({
  name: 'Email:Email',
  inputs: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Email title',
    },
  ],
})
export class Email extends React.Component<EmailProps> {
  render() {
    return (
      <React.Fragment>
        {/* <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"> */}
        <html>
          <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>{this.props.title}</title>
            <style type="text/css">{resetStyles}</style>
          </head>
          <body>{this.props.children}</body>
        </html>
      </React.Fragment>
    );
  }
}
