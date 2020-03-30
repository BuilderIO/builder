export type State = {
  selectedLocales: Set<string>
}

export type Action = {
  checked: boolean
  locale: string
}
