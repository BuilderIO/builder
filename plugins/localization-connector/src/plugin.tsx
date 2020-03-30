import React, { useState } from 'react'
import { Builder } from '@builder.io/sdk'
import TranslateIcon from '@material-ui/icons/Translate'
import { Button } from '@material-ui/core'
import { LocaleDialog } from './components/localeDialog'
import ClientSide from './components/clientSide'

const LocalizationConnector = (props: any) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<TranslateIcon />}
        onClick={() => setOpen(true)}
      >
        Localize
      </Button>
      <ClientSide>
        {open && (
          <LocaleDialog
            open={open}
            setOpen={setOpen}
            builderContext={props.context}
          />
        )}
      </ClientSide>
    </>
  )
}

Builder.registerEditor({
  name: 'localization-connector',
  component: LocalizationConnector,
})
