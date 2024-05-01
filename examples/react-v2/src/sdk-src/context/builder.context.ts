import { createContext } from "react";

export default createContext<any>({
  content: null,
  context: {},
  localState: undefined,
  rootSetState() {},
  rootState: {},
  apiKey: null,
  apiVersion: undefined,
  componentInfos: {},
  inheritedStyles: {},
  BlocksWrapper: "div",
  BlocksWrapperProps: {},
});
