import { BuilderElement } from "@builder.io/sdk";
import { Options } from "../interfaces/options";

export interface ComponentInfo {
  component: (block: BuilderElement, options: Options, attributes?: string) => string;
  noWrap?: boolean;
  name: string;
}

export function component(info: ComponentInfo) {
  components[info.name] = info;
  return info.component;
}

export function getComponentInfo(name: string) {
  return components[name];
}

export function getComponent(name: string) {
  const info = getComponentInfo(name)
  return info && info.component;
}

export const components: { [key: string]: ComponentInfo | undefined } = {};
