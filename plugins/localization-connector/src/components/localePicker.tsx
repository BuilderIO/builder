import React, { useReducer } from 'react'
import { FormGroup, FormControl } from '@material-ui/core'
import { SourceLocale } from './sourceLocale'
import { TargetLocales } from './targetLocales'
import { extractLocales } from '../services/propsExtractor'

export default (props: any) => {
  const { builderContext } = props
  const [sourceLocale, targetLocales] = extractLocales(builderContext)

  return (
    <FormControl component="fieldset">
      <FormGroup>
        <SourceLocale sourceLocale={sourceLocale} />
        <TargetLocales targetLocales={targetLocales} />
      </FormGroup>
    </FormControl>
  )
}
