import { ApplicationContext } from './application-context'

export interface CustomEditorProps<ValueType = string> {
  value: ValueType | undefined
  onChange(newValue: ValueType): void
  context: ApplicationContext
}
