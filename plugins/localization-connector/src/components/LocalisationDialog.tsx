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
import AlertDialog from './AlertDialog'
import { useSelectedLocalesReducer } from './reducers'

type LocalisationDialogProps = {
  setOpen: Function
  onResult: Function
}

const LocalisationDialog = (props: LocalisationDialogProps) => {
  if (pageHasNoBlocks()) {
    return (
      <AlertDialog
        severity="warning"
        setOpen={props.setOpen}
        message="Page has no blocks"
      />
    )
  }

  if (isLocaleNotEligibleToLocaliseFrom()) {
    return (
      <AlertDialog
        severity="warning"
        setOpen={props.setOpen}
        message="Current locale not allowed to be localised from"
      />
    )
  }

  if (modelHasOnlyOneLocale()) {
    return (
      <AlertDialog
        severity="warning"
        setOpen={props.setOpen}
        message="Model has only one locale"
      />
    )
  }

  const { setOpen } = props
  const { selectedLocales, dispatch } = useSelectedLocalesReducer()

  let memsourceArgs: any = undefined
  try {
    memsourceArgs = getMemsourceArguments()
  } catch (error) {
    return (
      <AlertDialog
        severity="warning"
        setOpen={props.setOpen}
        message={error.message}
      />
    )
  }

  const sendForLocalisation = async () => {
    if (memsourceArgs) {
      try {
        const jobUid = await new MemsourceService(
          memsourceArgs.memsourceToken
        ).sendTranslationJob(
          memsourceArgs.projectName,
          memsourceArgs.sourceLocale,
          [...selectedLocales],
          memsourceArgs.payload,
          memsourceArgs.memsourceInputSetting
        )

        props.onResult(
          'success',
          `Localisation request accepted with UID ${jobUid}`
        )
      } catch (error) {
        props.onResult('failure', error.message)
      }
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
