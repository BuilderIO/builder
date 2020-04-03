import { State, Action } from '../../types/Localization'
import { useReducer } from 'react'

const initialSelectedLocales: State = { selectedLocales: new Set() }

const selectedLocalesReducer = (state: State, action: Action): State => {
  const { locale, checked } = action
  if (checked) {
    return { selectedLocales: new Set(state.selectedLocales).add(locale) }
  } else {
    const selectedLocales = new Set(state.selectedLocales)
    selectedLocales.delete(locale)
    return { selectedLocales }
  }
}

export const useSelectedLocalesReducer = (): {
  selectedLocales: Set<string>
  dispatch: React.Dispatch<Action>
} => {
  const [{ selectedLocales }, dispatch] = useReducer(
    selectedLocalesReducer,
    initialSelectedLocales
  )

  return { selectedLocales, dispatch }
}
