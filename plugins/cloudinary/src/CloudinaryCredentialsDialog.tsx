/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import {
  Dialog,
  Button,
  DialogActions,
  DialogTitle,
  DialogContent,
  TextField,
} from '@material-ui/core';

interface CloudinaryCredentialsDialogProps {
  openDialog: boolean;
  apiKey: string | undefined;
  cloudName: string | undefined;
  closeDialog(): void;
  updateCloudinaryCredentials(apiKey: string, cloudName: string): void;
}

interface CloudinaryCredentialsDialogState {
  apiKey: string;
  cloudName: string;
}

export default class CloudinaryCredentialsDialog extends React.Component<
  CloudinaryCredentialsDialogProps,
  CloudinaryCredentialsDialogState
> {
  constructor(props: CloudinaryCredentialsDialogProps) {
    super(props);
    this.state = {
      apiKey: this.props.apiKey ? this.props.apiKey : '',
      cloudName: this.props.cloudName ? this.props.cloudName : '',
    };
  }

  render() {
    return (
      <div>
        <Dialog open={this.props.openDialog} onClose={this.props.closeDialog}>
          <DialogTitle>Cloudinary credentials setup</DialogTitle>
          <DialogContent>
            <TextField
              value={this.state.apiKey}
              onChange={(e: any) => this.setState({ apiKey: e.target.value })}
              id="apiKey"
              label="API key"
              helperText="You just have to setup the API key once and it will be linked to your organization"
              margin="normal"
              autoComplete="off"
            />
            <TextField
              value={this.state.cloudName}
              onChange={(e: any) => this.setState({ cloudName: e.target.value })}
              id="cloudName"
              label="Cloud name"
              helperText="You just have to setup the cloud name once and it will be linked to your organization"
              margin="normal"
              autoComplete="off"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.props.closeDialog} color="primary">
              Close
            </Button>
            <Button
              onClick={() => {
                this.props.updateCloudinaryCredentials(this.state.apiKey, this.state.cloudName);
                this.props.closeDialog();
              }}
              color="primary"
              variant="contained"
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
