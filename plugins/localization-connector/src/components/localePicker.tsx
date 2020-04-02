import React from 'react'
import { DialogContent, FormGroup, FormControl } from '@material-ui/core'
import { SourceLocale } from './sourceLocale'
import { TargetLocales } from './targetLocales'

export default (props: any) => {
  const { dispatch, sourceLocale, targetLocales } = props

  return (
    <DialogContent>
      <SourceLocale sourceLocale={sourceLocale} />
      <FormControl component="fieldset">
        <FormGroup>
          <TargetLocales targetLocales={targetLocales} dispatch={dispatch} />
        </FormGroup>
      </FormControl>
    </DialogContent>
  )
}
