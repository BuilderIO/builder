import React from 'react'
import { FormControlLabel, Checkbox } from '@material-ui/core'

export const LocaleOption = (props: any) => {
  const { label, dispatch } = props
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
