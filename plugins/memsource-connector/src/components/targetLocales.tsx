import React from 'react';
import { FormLabel, Grid } from '@material-ui/core';
import { LocaleOption } from './localeOption';
import Box from '@material-ui/core/Box';
import { getTargetLocales } from './contexts/builderContext';

type TargetLocalesProps = {
  dispatch: Function;
};

export const TargetLocales = ({ dispatch }: TargetLocalesProps) => {
  const targetLocales = getTargetLocales();
  return (
    <Box mt={2}>
      <Grid container direction="column">
        <Grid item>
          <FormLabel component="legend">Target locales:</FormLabel>
        </Grid>
        <Grid item container alignContent="flex-start" spacing={2}>
          {targetLocales?.map((each: string, key: number) => (
            <Grid item key={`${each}_${key}`}>
              <LocaleOption key={key} label={each} dispatch={dispatch} />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
};
