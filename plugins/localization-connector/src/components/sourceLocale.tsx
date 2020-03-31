import React from 'react'
import { FormLabel } from '@material-ui/core'

export const SourceLocale = (props: any) => {
  if (props.sourceLocale == undefined)
    return <div>locale not defined in current model</div>
  return (
    <>
      <FormLabel component="legend">Source locale</FormLabel>
      <FormLabel component="div">{props.sourceLocale}</FormLabel>
    </>
  )
}
