import React, { useReducer } from 'react'
import LocalePicker from './localePicker'
import { Dialog, DialogActions, Button } from '@material-ui/core'
import DialogTitle from './dialogTitle'
import { extractLocales } from '../services/propsExtractor'
import { handleSubmit } from '../services/dialogSubmitService'
import { State, Action } from '../types/Localization'

const selectedLocalesReducer = (state: State, action: Action): State => {
  const { locale, checked } = action
  if (checked) {
    return { selectedLocales: state.selectedLocales.add(locale) }
  } else {
    state.selectedLocales.delete(locale)
    return { selectedLocales: state.selectedLocales }
  }
}

const LocaleDialog = (props: any) => {
  const { setOpen, builderContext } = props
  const [sourceLocale, targetLocales] = extractLocales(builderContext)
  const initialSelectedLocales: State = { selectedLocales: new Set() }
  const [{ selectedLocales }, dispatch] = useReducer(
    selectedLocalesReducer,
    initialSelectedLocales
  )

  return (
    <Dialog
      aria-labelledby="simple-dialog-title"
      open={true}
      onClose={() => setOpen(false)}
    >
      <DialogTitle id="customized-dialog-title" onClose={() => setOpen(false)}>
        Locale picker
      </DialogTitle>
      <LocalePicker
        sourceLocale={sourceLocale}
        targetLocales={targetLocales}
        dispatch={dispatch}
      />
      <DialogActions>
        <Button
          color="primary"
          variant="contained"
          onClick={() =>
            handleSubmit(builderContext, sourceLocale, selectedLocales)
          }
          disabled={selectedLocales.size === 0}
        >
          Send job for translations
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export { LocaleDialog }
