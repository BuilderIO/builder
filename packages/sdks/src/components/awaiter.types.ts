export type AwaiterProps = {
  load: () => Promise<any>;
  props?: any;
  attributes?: any;
  fallback?: any;
  children?: any;
};
