/** @jsx jsx */
import React, { Fragment } from 'react';
import { jsx } from '@emotion/core';
import { Dialog, Button, DialogActions } from '@material-ui/core';

interface CloudinaryMediaLibraryDialogProps {
  openDialog: boolean;
  closeDialog(): void;
  selectImage(image: CloudinaryImage): void;
  apiKey: string | undefined;
  cloudName: string | undefined;
}

export interface CloudinaryImage {
  context: any;
  public_id: string;
  url: string;
  tags: any[];
  derived: any[];
}

export class CloudinaryMediaLibraryDialog extends React.Component<
  CloudinaryMediaLibraryDialogProps
> {
  private generateNewMediaLibrary(): any {
    let mediaLibrary: any;
    const newWindow = window as any;
    if (newWindow.cloudinary) {
      mediaLibrary = this.createMediaLibrary(mediaLibrary, newWindow);
    }
    return mediaLibrary;
  }

  private openCloudinaryMediaLibrary() {
    const mediaLibrary = this.generateNewMediaLibrary();
    this.showMediaLibrary(mediaLibrary);
  }

  private showMediaLibrary(mediaLibrary: any) {
    if (mediaLibrary) {
      mediaLibrary.show({
        multiple: false,
        max_files: 1,
      });
    }
  }

  private createMediaLibrary(mediaLibrary: any, newWindow: any) {
    mediaLibrary = newWindow.cloudinary.createMediaLibrary(
      {
        cloud_name: this.props.cloudName ? this.props.cloudName : '',
        api_key: this.props.apiKey ? this.props.apiKey : '',
        inline_container: '.cloudinaryContainer',
      },
      {
        insertHandler: (data: any) => {
          this.selectImage({
            ...data.assets[0],
          });
        },
      }
    );
    return mediaLibrary;
  }

  private selectImage(cloudinaryData: any): void {
    this.props.selectImage(cloudinaryData);
    this.props.closeDialog();
  }

  render() {
    return (
      <Fragment>
        <Dialog
          open={this.props.openDialog}
          onClose={this.props.closeDialog}
          fullWidth={true}
          maxWidth="lg"
          onRendered={() => {
            this.openCloudinaryMediaLibrary();
          }}
        >
          <div className="cloudinaryContainer" css={{ height: '90vh' }} />
          <DialogActions>
            <Button autoFocus onClick={this.props.closeDialog} color="primary">
              Close media library
            </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    );
  }
}
