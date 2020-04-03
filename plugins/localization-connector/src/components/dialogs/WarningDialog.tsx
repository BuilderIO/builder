import React from 'react'
import { Dialog } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

const alertMessageSwitch = {
  'no-blocks': 'Page has no blocks',
  disallowed: 'Current locale not allowed to be localised from',
  'one-locale': 'Model has only one locale'
}

export default ({
  setOpen,
  condition
}: {
  setOpen: Function
  condition: 'no-blocks' | 'disallowed' | 'one-locale'
}) => {
  return (
    <Dialog open={true} onClose={() => setOpen(false)}>
      <Alert severity="warning">{alertMessageSwitch[condition]}</Alert>
    </Dialog>
  )
}
