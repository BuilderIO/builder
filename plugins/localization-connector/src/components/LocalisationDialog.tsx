import React from 'react'
import {
  Dialog,
  DialogActions,
  Button,
  DialogContent,
  FormControl,
  FormGroup
} from '@material-ui/core'
import DialogTitle from './dialogTitle'
import { SourceLocale } from './sourceLocale'
import { TargetLocales } from './targetLocales'
import {
  pageHasNoBlocks,
  isLocaleNotEligibleToLocaliseFrom,
  modelHasOnlyOneLocale,
  getMemsourceArguments
} from './contexts/builderContext'
import { MemsourceService } from '../services/memsourceService'
import WarningDialog from './dialogs/WarningDialog'
import { useSelectedLocalesReducer } from './reducers/selectedLocalesReducer'

type LocalisationDialogProps = {
  setOpen: Function
}

const LocalisationDialog = (props: LocalisationDialogProps) => {
  if (pageHasNoBlocks()) {
    return <WarningDialog setOpen={props.setOpen} condition="no-blocks" />
  }

  if (isLocaleNotEligibleToLocaliseFrom()) {
    return <WarningDialog setOpen={props.setOpen} condition="disallowed" />
  }

  if (modelHasOnlyOneLocale()) {
    return <WarningDialog setOpen={props.setOpen} condition="one-locale" />
  }

  const { setOpen } = props
  const { selectedLocales, dispatch } = useSelectedLocalesReducer()

  const memsourceArgs = getMemsourceArguments()
  const sendForLocalisation = () => {
    if (memsourceArgs) {
      new MemsourceService(memsourceArgs.memsourceToken).sendTranslationJob(
        memsourceArgs.projectName,
        memsourceArgs.sourceLocale,
        [...selectedLocales],
        memsourceArgs.payload,
        memsourceArgs.memsourceInputSetting
      )

      alert('Job(s) sent!')
      setOpen(false)
    }
  }
  return (
    <Dialog
      aria-labelledby="simple-dialog-title"
      open={true}
      onClose={() => setOpen(false)}
    >
      <DialogTitle id="customized-dialog-title" onClose={() => setOpen(false)}>
        Locale picker
      </DialogTitle>
      <DialogContent>
        <SourceLocale />
        <FormControl component="fieldset">
          <FormGroup>
            <TargetLocales dispatch={dispatch} />
          </FormGroup>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            sendForLocalisation()
          }}
          disabled={selectedLocales.size === 0}
        >
          Send job for translations
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export { LocalisationDialog }
