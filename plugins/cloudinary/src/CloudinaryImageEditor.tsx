/** @jsx jsx */
import { jsx } from '@emotion/core'
import React from 'react'
import { Builder } from '@builder.io/sdk'
import { Typography, Button } from '@material-ui/core'
import {
  CloudinaryMediaLibraryDialog,
  CloudinaryImage
} from './CloudinaryMediaLibraryDialog'
import CloudinayCredentialsDialog from './CloudinaryCredentialsDialog'

interface Props {
  value?: string
  onChange(newValue: CloudinaryImage): void
  context: any
}

// No need to use username for cloudinary login if SSO is enabled
interface CloudinaryImageEditorState {
  showDialog: boolean
  apiKey: string | undefined
  cloudName: string | undefined
  requestCredentials: boolean
}

export default class CloudinaryImageEditor extends React.Component<
  Props,
  CloudinaryImageEditorState
> {
  get organization() {
    return this.props.context.user.organization
  }

  get cloudinaryCloud(): string | undefined {
    return this.organization.value.settings.plugins.get('cloudinaryCloud')
  }

  set cloudinaryCloud(cloud: string | undefined) {
    this.organization.value.settings.plugins.set('cloudinaryCloud', cloud)
    this.organization.save()
  }

  get cloudinaryKey(): string | undefined {
    return this.organization.value.settings.plugins.get('cloudinaryKey')
  }

  set cloudinaryKey(key: string | undefined) {
    this.organization.value.settings.plugins.set('cloudinaryKey', key)
    this.organization.save()
  }

  constructor(props: any) {
    super(props)
    this.state = {
      requestCredentials: false,
      showDialog: false,
      apiKey: this.cloudinaryKey ? this.cloudinaryKey : '',
      cloudName: this.cloudinaryCloud ? this.cloudinaryCloud : ''
    }
  }

  private closeDialog() {
    this.setState({
      requestCredentials: false,
      showDialog: false
    })
  }

  private appendMediaLibraryScriptToPlugin() {
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://media-library.cloudinary.com/global/all.js'
    document.head.appendChild(script)
  }

  private shouldRequestCloudinaryCredentials() {
    return (
      this.state.requestCredentials ||
      this.state.apiKey === '' ||
      this.state.cloudName === ''
    )
  }

  private updateCloudinaryCredentials(apiKey: string, cloudName: string) {
    this.cloudinaryKey = apiKey
    this.cloudinaryCloud = cloudName
    this.setState({
      apiKey: this.cloudinaryKey,
      cloudName: this.cloudinaryCloud
    })
  }

  private selectImage(image: CloudinaryImage) {
    this.props.onChange(image)
  }

  componentDidMount() {
    this.appendMediaLibraryScriptToPlugin()
  }

  render() {
    const shouldRequestCloudinarySettings = this.shouldRequestCloudinaryCredentials()
    const buttonStyle = { width: '45%', margin: '5px' }
    return (
      <div css={{ padding: '15px 0' }}>
        <Typography variant="caption">Cloudinary image picker</Typography>
        {shouldRequestCloudinarySettings && (
          <CloudinayCredentialsDialog
            openDialog={this.state.showDialog}
            closeDialog={this.closeDialog.bind(this)}
            updateCloudinaryCredentials={this.updateCloudinaryCredentials.bind(
              this
            )}
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

        <div>
          <Button
            css={buttonStyle}
            color="primary"
            variant="contained"
            onClick={() => {
              this.setState({
                showDialog: !this.state.showDialog
              })
            }}
          >
            Choose Image
          </Button>

          <Button
            variant="contained"
            color="primary"
            css={buttonStyle}
            onClick={() => {
              this.setState({
                requestCredentials: true,
                showDialog: !this.state.showDialog
              })
            }}
          >
            Set credentials
          </Button>
        </div>
      </div>
    )
  }
}

Builder.registerEditor({
  name: 'cloudinaryImageEditor',
  component: CloudinaryImageEditor
})
