import React from 'react'
import { Builder } from '@builder.io/sdk'
import Button from '@material-ui/core/Button'
import TranslateIcon from '@material-ui/icons/Translate'

const LocalizationConnector = () => (
  <Button variant="contained" color="primary" startIcon={<TranslateIcon />}>
    Localize
  </Button>
)

Builder.registerEditor({
  name: 'localization-connector',
  component: LocalizationConnector,
})
