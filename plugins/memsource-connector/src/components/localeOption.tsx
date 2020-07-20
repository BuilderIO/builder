import React from 'react';
import { FormControlLabel } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
type LocaleOptionProps = {
  label: string;
  dispatch: Function;
};

export const LocaleOption = ({ label, dispatch }: LocaleOptionProps) => {
  return (
    <FormControlLabel
      control={
        <Checkbox
          name={label}
          color="primary"
          data-testid={`${label}-checkbox`}
          onChange={(event) =>
            dispatch({
              locale: event.target.name,
              checked: event.target.checked
            })
          }
        />
      }
      label={label}
    />
  );
};
