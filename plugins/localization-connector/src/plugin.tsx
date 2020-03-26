import React from 'react'
import { Builder } from '@builder.io/sdk'
import { Button, Icon } from '@material-ui/core'
import TranslateIcon from '@material-ui/icons/Translate'

class LocalizationConnector extends React.Component<any> {
  render() {
    return (
      <Button color="primary" endIcon={<TranslateIcon />}>
        Localize
      </Button>
    )
  }
}

Builder.registerEditor({
  name: 'localization-connector',
  component: LocalizationConnector,
})
