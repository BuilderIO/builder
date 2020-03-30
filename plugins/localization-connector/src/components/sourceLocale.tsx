import React from 'react'
import { FormLabel } from '@material-ui/core'

export const SourceLocale = (props: any) => (
  <>
    <FormLabel component="legend">Source locales</FormLabel>
    <FormLabel component="div">{props.sourceLocale}</FormLabel>
  </>
)
