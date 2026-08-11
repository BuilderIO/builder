export interface CustomReactEditorProps<T = any> {
  value?: T;
  onChange(val: T | undefined | null): void;
  context: any;
  field?: any;
}
