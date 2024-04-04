/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import { Builder } from '@builder.io/sdk';
import { Typography, Button } from '@material-ui/core';
import { CloudinaryMediaLibraryDialog, CloudinaryImage } from './CloudinaryMediaLibraryDialog';
import CloudinayCredentialsDialog from './CloudinaryCredentialsDialog';

interface Props {
  value?: any;
  onChange(newValue: CloudinaryImage): void;
  context: any;
}

// No need to use username for cloudinary login if SSO is enabled
interface CloudinaryImageEditorState {
  showDialog: boolean;
  apiKey: string | undefined;
  cloudName: string | undefined;
  requestCredentials: boolean;
  selectedImagePublicId: string | undefined;
}

type ButtonVariant = 'text' | 'contained';

export default class CloudinaryImageEditor extends React.Component<
  Props,
  CloudinaryImageEditorState
> {
  get organization() {
    return this.props.context.user.organization;
  }

  get cloudinaryCloud(): string | undefined {
    return this.organization.value.settings.plugins.get('cloudinaryCloud');
  }

  set cloudinaryCloud(cloud: string | undefined) {
    this.organization.value.settings.plugins.set('cloudinaryCloud', cloud);
    this.organization.save();
  }

  get cloudinaryKey(): string | undefined {
    return this.organization.value.settings.plugins.get('cloudinaryKey');
  }

  set cloudinaryKey(key: string | undefined) {
    this.organization.value.settings.plugins.set('cloudinaryKey', key);
    this.organization.save();
  }

  constructor(props: any) {
    super(props);

    this.state = {
      requestCredentials: false,
      showDialog: false,
      apiKey: this.cloudinaryKey ? this.cloudinaryKey : '',
      cloudName: this.cloudinaryCloud ? this.cloudinaryCloud : '',
      selectedImagePublicId:
        props.value && props.value.get && props.value.get('public_id')
          ? props.value.get('public_id')
          : '',
    };
  }

  private closeDialog() {
    this.setState({
      requestCredentials: false,
      showDialog: false,
    });
  }

  private appendMediaLibraryScriptToPlugin() {
    const previousScript = document.getElementById('cloudinaryScript');
    if (!previousScript) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://media-library.cloudinary.com/global/all.js`;
      script.id = 'cloudinaryScript';
      document.head.appendChild(script);
    }
  }

  private areCloudinaryCredentialsNotSet(): boolean {
    return (
      this.state.apiKey === '' ||
      this.state.cloudName === '' ||
      this.state.apiKey === undefined ||
      this.state.cloudName === undefined
    );
  }

  private shouldRequestCloudinaryCredentials() {
    return this.state.requestCredentials || this.areCloudinaryCredentialsNotSet();
  }

  private updateCloudinaryCredentials(apiKey: string, cloudName: string) {
    this.cloudinaryKey = apiKey;
    this.cloudinaryCloud = cloudName;
    this.setState({
      apiKey: this.cloudinaryKey,
      cloudName: this.cloudinaryCloud,
    });
  }

  private calculateChooseImageButtonVariant(): ButtonVariant {
    return this.areCloudinaryCredentialsNotSet() ? 'contained' : 'text';
  }

  private selectImage(image: CloudinaryImage) {
    this.props.onChange(image);
    this.setState({ selectedImagePublicId: image.public_id });
  }

  buildSelectedIdMessage(): string {
    if (this.state.selectedImagePublicId) {
      return `Public id: ${this.state.selectedImagePublicId}`;
    }

    return 'Please choose an image';
  }

  buildChooseImageText(): string {
    if (this.state.selectedImagePublicId) {
      return `UPDATE IMAGE`;
    }

    return 'CHOOSE IMAGE';
  }

  setCredentialsButtonText(): string {
    return this.areCloudinaryCredentialsNotSet() ? 'Set credentials' : '...';
  }

  componentDidMount() {
    this.appendMediaLibraryScriptToPlugin();
  }

  render() {
    const shouldRequestCloudinarySettings = this.shouldRequestCloudinaryCredentials();
    const setCredentialsButtonVariant = this.calculateChooseImageButtonVariant();
    const selectedPublicIdMessage = this.buildSelectedIdMessage();
    const chooseImageButtonText = this.buildChooseImageText();
    const setCredentialsButtonText = this.setCredentialsButtonText();
    const buttonContainerStyle = {
      display: 'grid',
      gap: '10px',
      gridTemplateColumns: '1fr max-content',
      marginTop: '5px',
      marginBottom: '5px',
    };
    return (
      <div css={{ padding: '15px 0' }}>
        <Typography variant="caption">Cloudinary image picker</Typography>
        {shouldRequestCloudinarySettings && (
          <CloudinayCredentialsDialog
            openDialog={this.state.showDialog}
            closeDialog={this.closeDialog.bind(this)}
            updateCloudinaryCredentials={this.updateCloudinaryCredentials.bind(this)}
            apiKey={this.state.apiKey}
            cloudName={this.state.cloudName}
          />
        )}
        {!shouldRequestCloudinarySettings && (
          <CloudinaryMediaLibraryDialog
            openDialog={this.state.showDialog}
            closeDialog={this.closeDialog.bind(this)}
            selectImage={this.selectImage.bind(this)}
            apiKey={this.state.apiKey}
            cloudName={this.state.cloudName}
          />
        )}

        <div css={buttonContainerStyle}>
          <Button
            disabled={this.areCloudinaryCredentialsNotSet()}
            color="primary"
            variant="contained"
            onClick={() => {
              this.setState({
                showDialog: !this.state.showDialog,
              });
            }}
          >
            {chooseImageButtonText}
          </Button>

          <Button
            variant={setCredentialsButtonVariant}
            color="primary"
            onClick={() => {
              this.setState({
                requestCredentials: true,
                showDialog: !this.state.showDialog,
              });
            }}
          >
            {setCredentialsButtonText}
          </Button>
        </div>
        <div>
          <Typography css={{ margin: '5px' }} variant="caption">
            {selectedPublicIdMessage}
          </Typography>
        </div>
      </div>
    );
  }
}

Builder.registerEditor({
  name: 'cloudinaryImageEditor',
  component: CloudinaryImageEditor,
});
