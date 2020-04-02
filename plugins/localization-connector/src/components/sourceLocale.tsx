import React from 'react'
import { Typography, Grid } from '@material-ui/core'

export const SourceLocale = (props: any) => {
  if (props.sourceLocale === undefined) {
    return <div>locale not defined in current model</div>
  }
  return (
    <Grid container justify="center">
      <Grid item xs={8}>
        <Typography variant="subtitle1">Source locale:</Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography variant="subtitle1">{props.sourceLocale}</Typography>
      </Grid>
    </Grid>
  )
}
