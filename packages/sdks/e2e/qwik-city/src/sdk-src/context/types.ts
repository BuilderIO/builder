import type { BuilderContent } from '../types/builder-content';
type ComponentInfo = object;

export type RegisteredComponent = ComponentInfo & {
  component: any;
};
export type RegisteredComponents = object;
export type BuilderRenderState = Record<string, unknown>;
export type BuilderRenderContext = Record<string, unknown>;
export interface BuilderContextInterface {
  content: BuilderContent;
  context: BuilderRenderContext;
  /**
   * The state of the application.
   *
   * NOTE: see `localState` below to understand how it is different from `rootState`.
   */
  rootState: BuilderRenderState;
  /**
   * Some frameworks have a `setState` function which needs to be invoked to notify
   * the framework of state change. (other frameworks don't in which case it is `undefined')
   */
  rootSetState: ((rootState: BuilderRenderState) => void) | undefined;
  /**
   * The local state of the current component. This is different from `rootState` in that
   * it can be a child state created by a repeater containing local state.
   * The `rootState` is where all of the state mutations are actually stored.
   */
  localState: BuilderRenderState | undefined;
  apiKey: string | null;
  apiVersion: '' | undefined;
  componentInfos: object;
  // Used to recursively store all CSS coming from a parent that would apply to a Text block
  inheritedStyles: Record<string, unknown>;
}
