import React from 'react';
import { getSourceLocale } from './contexts/builderContext';
import { Typography, Grid } from '@material-ui/core';

export const SourceLocale = () => {
  const sourceLocale = getSourceLocale();
  return (
    <Grid container justify="center">
      <Grid item xs={8}>
        <Typography variant="subtitle1">Source locale:</Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography variant="subtitle1">{sourceLocale}</Typography>
      </Grid>
    </Grid>
  );
};
