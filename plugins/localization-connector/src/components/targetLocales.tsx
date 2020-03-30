import React, { useReducer } from 'react'
import { FormLabel, Button } from '@material-ui/core'
import { MemsourceService } from '../services/memsourceService'
import { extractMemsourceToken } from '../services/propsExtractor'
import { State, Action } from '../types/Localization'
import { LocaleOption } from './localeOption'

const selectedLocalesReducer = (state: State, action: Action): State => {
  const { locale, checked } = action
  if (checked) {
    return { selectedLocales: state.selectedLocales.add(locale) }
  } else {
    state.selectedLocales.delete(locale)
    return { selectedLocales: state.selectedLocales }
  }
}

export const TargetLocales = (props: any) => {
  const initialSelectedLocales: State = { selectedLocales: new Set() }

  const { targetLocales, builderContext } = props
  if (!targetLocales) return <></>

  const [{ selectedLocales }, dispatch] = useReducer(
    selectedLocalesReducer,
    initialSelectedLocales
  )

  const handleSubmit = () => {
    const accepted = confirm('Are you sure?')
    if (accepted) {
      const memsourceToken = extractMemsourceToken(builderContext)
      const svc = new MemsourceService(memsourceToken)
      // svc.sendTranslationJob(_, sourceLocale, [...selectedLocales], {})
    }
  }

  return (
    <>
      <FormLabel component="legend">Target locales</FormLabel>
      {targetLocales.map((each: string) => (
        <LocaleOption label={each} dispatch={dispatch} />
      ))}

      <Button
        color="primary"
        variant="contained"
        onClick={handleSubmit}
        disabled={selectedLocales.size === 0}
      >
        Send job for translations
      </Button>
    </>
  )
}
