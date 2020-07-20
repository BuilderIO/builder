import React from 'react';
import { Dialog } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import MuiDialogTitle from './dialogTitle';

export default ({
  setOpen,
  severity,
  message
}: {
  setOpen: Function;
  severity: 'warning' | 'success' | 'error' | 'info';
  message: string;
}) => {
  let msg = '';
  if (message) msg = message;
  return (
    <Dialog open={true} onClose={() => setOpen(false)}>
      <MuiDialogTitle onClose={() => setOpen(false)}>{severity}</MuiDialogTitle>
      <Alert severity={severity}>
        <div data-testid="alert-dialog-message">{msg}</div>
      </Alert>
    </Dialog>
  );
};
