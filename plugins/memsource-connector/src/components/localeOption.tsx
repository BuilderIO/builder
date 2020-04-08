import React from 'react'
import { FormControlLabel, Checkbox } from '@material-ui/core'

type LocaleOptionProps = {
  label: string
  dispatch: Function
}

export const LocaleOption = ({ label, dispatch }: LocaleOptionProps) => {
  return (
    <FormControlLabel
      control={
        <Checkbox
          name={label}
          color="primary"
          onChange={event =>
            dispatch({
              locale: event.target.name,
              checked: event.target.checked
            })
          }
        />
      }
      label={label}
    />
  )
}
