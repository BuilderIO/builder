import React from 'react'
import CloseIcon from '@material-ui/icons/Close'
import {
  Dialog,
  DialogTitle,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
  List,
  ListItem
} from '@material-ui/core'

const LocalePicker = (props: any) => {
  const { open, setOpen, builderContext } = props
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
                    <Checkbox name={`target-locale-${index}`} color="primary" />
                  }
                  label={each}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <></>
        )}
      </FormGroup>
    </Dialog>
  )
}

export { LocalePicker }
