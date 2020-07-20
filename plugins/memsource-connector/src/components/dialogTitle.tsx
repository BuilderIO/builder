import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import { DialogTitle, IconButton, Typography } from '@material-ui/core';

const MuiDialogTitle = withStyles(({ spacing, palette }) => ({
  closeButton: {
    position: 'absolute',
    right: spacing(1),
    top: spacing(1),
    color: palette.grey[500]
  }
}))((props: any) => {
  const { children, classes, onClose, other } = props;
  return (
    <DialogTitle disableTypography {...other}>
      <Typography variant="h6">{children}</Typography>
      <IconButton
        aria-label="close"
        className={classes.closeButton}
        onClick={onClose}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  );
});

export default MuiDialogTitle;
