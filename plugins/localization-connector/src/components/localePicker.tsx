import React, { useReducer } from 'react'
import CloseIcon from '@material-ui/icons/Close'
import {
  Dialog,
  DialogTitle,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  Button
} from '@material-ui/core'

type State = {
  selectedLocales: Set<string>
}

type Action = {
  checked: boolean
  locale: string
}

const initialState: State = { selectedLocales: new Set() }
const reducer = (state: State, { locale, checked }: Action): State => {
  if (checked) {
    return { selectedLocales: state.selectedLocales.add(locale) }
  } else {
    state.selectedLocales.delete(locale)
    return { selectedLocales: state.selectedLocales }
  }
}

const extractLocales = (open: boolean, builderContext: any) => {
  let sourceLocale = undefined
  let targetLocales = undefined
  if (open) {
    try {
      sourceLocale = builderContext.designerState.editingContentModel.data.toJSON()
        .locale
      targetLocales = builderContext.designerState.editingContentModel.model.fields
        .find((field: any) => field.name === 'locale')
        .enum.toJSON()

      targetLocales.splice(targetLocales.indexOf(sourceLocale), 1)
    } catch {}
  }
  return [sourceLocale, targetLocales]
}

const LocalePicker = (props: any) => {
  const { open, setOpen, builderContext } = props
  const [sourceLocale, targetLocales] = extractLocales(open, builderContext)

  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <Dialog
      aria-labelledby="simple-dialog-title"
      open={open}
      onClose={() => {
        setOpen(false)
      }}
    >
      <DialogTitle id="simple-dialog-title">
        Locale picker
        <IconButton aria-label="close" onClick={() => setOpen(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <FormGroup row>
        <List>
          <ListItem>Source locale</ListItem>
          <ListItem>{sourceLocale}</ListItem>
        </List>
        {targetLocales ? (
          <List>
            <ListItem>Target locales</ListItem>
            {targetLocales.map((each: string, index: number) => (
              <ListItem>
                <FormControlLabel
                  control={
                    <Checkbox
                      name={`target-locale-${index}`}
                      color="primary"
                      onChange={event => {
                        dispatch({
                          locale: event.target.name,
                          checked: event.target.checked
                        })
                      }}
                    />
                  }
                  label={each}
                />
              </ListItem>
            ))}
            {state.selectedLocales.size > 0 && (
              <Button color="primary" variant="contained">
                Send for translations
              </Button>
            )}
          </List>
        ) : (
          <></>
        )}
      </FormGroup>
    </Dialog>
  )
}

export { LocalePicker }
