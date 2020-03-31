import React from 'react'
import LocalePicker from './localePicker'
import CloseIcon from '@material-ui/icons/Close'
import { Dialog, DialogTitle, IconButton } from '@material-ui/core'

const LocaleDialog = (props: any) => {
  const { open, setOpen } = props

  return (
    <Dialog
      aria-labelledby="simple-dialog-title"
      open={open}
      onClose={() => {
        setOpen(false)
      }}
    >
      <DialogTitle id="simple-dialog-title">
        Locale picker
        <IconButton
          aria-label="close"
          onClick={() => {
            console.log('Icon button on click')
            setOpen(false)
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <LocalePicker {...props} />
    </Dialog>
  )
}

export { LocaleDialog }
