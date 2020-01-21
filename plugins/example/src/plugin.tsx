/** @jsx jsx */
import { jsx } from '@emotion/core'
import { CSSPropertiesWithMultiValues } from '@emotion/serialize'
import React from 'react'
import { Builder } from '@builder.io/sdk'
import { Dialog, Button } from '@material-ui/core'

interface Props {
  value?: string
  onChange(newValue: string): void
  context: any
}

class ExampleEditor extends React.Component<Props> {
  state = {
    showDialog: false
  }

  // TODO: if key is not set, prompt the user for their cloudinary key and set it via the
  // setter below
  get organization() {
    return this.props.context.user.organization
  }

  get cloudinaryKey(): string | undefined {
    return this.organization.value.settings.plugins.get('cloudinaryKey')
  }

  set cloudinaryKey(key: string | undefined) {
    this.organization.value.settings.plugins.set('cloudinaryKey', key)
    this.organization.save()
  }

  closeDialog() {
    this.setState({
      ...this.state,
      showDialog: false
    })
  }

  render() {
    const imageStyle: CSSPropertiesWithMultiValues = {
      width: 200,
      height: 200,
      cursor: 'pointer',
      objectFit: 'cover',
      borderRadius: 4,
      backgroundColor: '#f8f8f8'
    }

    return (
      <div css={{ padding: '15px 0' }}>
        <Dialog
          open={this.state.showDialog}
          onClose={() => {
            this.closeDialog()
          }}
        >
          <div
            css={{
              padding: 50,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}
          >
            <img
              css={imageStyle}
              src="https://images.pexels.com/photos/2974657/pexels-photo-2974657.jpeg"
              onClick={() => {
                this.closeDialog()
                this.props.onChange(
                  'https://images.pexels.com/photos/2974657/pexels-photo-2974657.jpeg'
                )
              }}
            />
            <img
              css={imageStyle}
              src="https://images.pexels.com/photos/2985927/pexels-photo-2985927.jpeg"
              onClick={() => {
                this.closeDialog()
                this.props.onChange(
                  'https://images.pexels.com/photos/2985927/pexels-photo-2985927.jpeg'
                )
              }}
            />
            <img
              css={imageStyle}
              src="https://images.pexels.com/photos/2538412/pexels-photo-2538412.jpeg"
              onClick={() => {
                this.closeDialog()
                this.props.onChange(
                  'https://images.pexels.com/photos/2538412/pexels-photo-2538412.jpeg'
                )
              }}
            />
          </div>
        </Dialog>
        <Button
          color="primary"
          variant="contained"
          fullWidth
          onClick={() => {
            this.setState({
              ...this.state,
              showDialog: !this.state.showDialog
            })
          }}
        >
          Choose Image
        </Button>
      </div>
    )
  }
}

Builder.registerEditor({
  /**
   * Here we override the built-in "file" type editor. You can also create your own
   * type instead - e.g. name: 'ExampleImage' and that can be set as input field "types"
   * in the Builder.io webapp or in custom components
   */
  name: 'file',
  component: ExampleEditor
})
