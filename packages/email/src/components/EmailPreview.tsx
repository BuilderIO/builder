import { resetStyles } from '../constants/reset-styles';
import React from 'react';

interface EmailPreviewProps {}

export class EmailPreview extends React.Component<EmailPreviewProps> {
  render() {
    return (
      <div>
        <style type="text/css">{resetStyles}</style>
        {this.props.children}
      </div>
    );
  }
}
