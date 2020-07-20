import { resetStyles } from '../constants/reset-styles';
import React from 'react';
import { BuilderComponent } from '@builder.io/react';
import { BuilderPageProps } from '@builder.io/react/dist/types/src/components/builder-page.component';
import { EmailPreview } from './EmailPreview';

interface EmailPreviewComponentProps extends BuilderPageProps {}

export class EmailPreviewComponent extends React.Component<EmailPreviewComponentProps> {
  render() {
    return (
      <EmailPreview>
        <BuilderComponent emailMode {...this.props} />
      </EmailPreview>
    );
  }
}
