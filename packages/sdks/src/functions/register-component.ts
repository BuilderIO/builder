// TODO
export type ComponentInfo = any;

export const components: Record<string, any> = {};

export function registerComponent(ref: any, info: ComponentInfo) {
  components[info.name] = ref;

  // Message window of a component registered
}
