import React, { useState } from 'react'
import { Button } from '@material-ui/core'
import { LocalisationDialog } from './LocalisationDialog'

export default () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Localize
      </Button>
      {open && <LocalisationDialog setOpen={setOpen} />}
    </>
  )
}
