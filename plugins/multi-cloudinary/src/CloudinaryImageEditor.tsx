/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import { Builder } from '@builder.io/sdk';
import { Button } from '@material-ui/core';
// import { MoreVert } from '@material-ui/icons';
import { CloudinaryMediaLibraryDialog, CloudinaryImage } from './CloudinaryMediaLibraryDialog';
import CloudinayCredentialsDialog from './CloudinaryCredentialsDialog';
import { UploadIcon } from './svgIcons/uploadIcon';

interface Props {
  value?: any;
  onChange(newValue: { data: CloudinaryImage[]; editor: string; type: string }): void;
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

  get multiCloudinaryCloud(): string | undefined {
    return this.organization.value.settings.plugins.get('multiCloudinaryCloud');
  }

  set multiCloudinaryCloud(cloud: string | undefined) {
    this.organization.value.settings.plugins.set('multiCloudinaryCloud', cloud);
    this.organization.save();
  }

  get multiCloudinaryKey(): string | undefined {
    return this.organization.value.settings.plugins.get('multiCloudinaryKey');
  }

  set multiCloudinaryKey(key: string | undefined) {
    this.organization.value.settings.plugins.set('multiCloudinaryKey', key);
    this.organization.save();
  }

  constructor(props: any) {
    super(props);

    this.state = {
      requestCredentials: false,
      showDialog: false,
      apiKey: this.multiCloudinaryKey ? this.multiCloudinaryKey : '',
      cloudName: this.multiCloudinaryCloud ? this.multiCloudinaryCloud : '',
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
    this.multiCloudinaryKey = apiKey;
    this.multiCloudinaryCloud = cloudName;
    this.setState({
      apiKey: this.multiCloudinaryKey,
      cloudName: this.multiCloudinaryCloud,
    });
  }

  private calculateChooseImageButtonVariant(): ButtonVariant {
    return this.areCloudinaryCredentialsNotSet() ? 'contained' : 'text';
  }

  private selectImages(images: CloudinaryImage[]) {
    this.props.onChange({ data: images, editor: 'cloudinaryMultipleImageEditor',type: 'multi' });
  }

  buildImageName(): string {
    if (this.props?.value && this.props.value?.get && this.props.value?.get('public_id')) {
      return this.props?.value && this.props.value?.get && this.props.value?.get('public_id');
    }

    return 'No Image Chosen';
  }

  buildChooseImageText(): string {
    if (this.state.selectedImagePublicId) {
      return `UPDATE IMAGES`;
    }

    return 'CHOOSE IMAGES';
  }

  setCredentialsButtonText(): string {
    return this.areCloudinaryCredentialsNotSet() ? 'Set credentials' : '...';
  }

 truncateString(str: string, maxLength = 30) {
    if (str.length > maxLength) {
      return str.slice(0, maxLength) + '...';
    }
    return str;
  }
  

  componentDidMount() {
    this.appendMediaLibraryScriptToPlugin();
  }

  render() {
    const shouldRequestCloudinarySettings = this.shouldRequestCloudinaryCredentials();
    const setCredentialsButtonVariant = this.calculateChooseImageButtonVariant();
    const selectedImageName = this.buildImageName();
    const setCredentialsButtonText = this.setCredentialsButtonText();
    const buttonContainerStyle = {
      display: 'grid',
      gap: '10px',
      gridTemplateColumns: '1fr max-content',
      marginTop: '16px',
      marginBottom: '5px',
      fontSize: 14,
    };
    const mainContainerStyle = {
      display: 'flex',
      width: 240,
      height: 90,
      padding: 8,
      gap: 8,
      alignItems: 'center',
      borderRadius: 4,
      border: '1px solid #D5D5D5',
    };
    return (
      <div css={{ padding: '4px 0' }}>
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
            selectImages={this.selectImages.bind(this)}
            apiKey={this.state.apiKey}
            cloudName={this.state.cloudName}
          />
        )}

        <div css={mainContainerStyle}>
          <div>
            {this.props?.value && this.props.value?.get && this.props.value?.get('secure_url') ? (
              <img
                src={
                  this.props?.value && this.props.value?.get && this.props.value?.get('secure_url')
                }
                height={64}
                width={64}
              />
            ) : (
              <div css={{ padding: 16, backgroundColor: '#F5F5F5', borderRadius: 4 }}>
                <UploadIcon />
              </div>
            )}
          </div>

            <div css={{ padding: '6px 8px', overflow: 'hidden' }}>{this.truncateString(selectedImageName)}</div>

        </div>

        <div css={buttonContainerStyle}>
          <Button
          css={{'&:disabled': {
            backgroundColor:'#F5F5F5',
            color:'#757575'
          }}}
            disabled={this.areCloudinaryCredentialsNotSet()}
            color="primary"
            variant="contained"
            onClick={() => {
              this.setState({
                showDialog: !this.state.showDialog,
              });
            }}
          >
            Add Images
          </Button>

          <Button
            color="primary"
            variant={setCredentialsButtonVariant}
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
      </div>
    );
  }
}

Builder.registerEditor({
  name: 'cloudinaryMultipleImageEditor',
  component: CloudinaryImageEditor,
});
