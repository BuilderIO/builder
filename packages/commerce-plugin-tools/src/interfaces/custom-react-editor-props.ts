export interface CustomReactEditorProps<T = any> {
  value?: T;
  onChange(val: T | undefined): void;
  context: any;
  field?: any;
}
