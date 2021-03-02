export interface CustomReactEditorProps<T = any> {
  value: T | undefined;
  onChange(val: T | undefined): void;
  context: any;
  field?: any;
}
