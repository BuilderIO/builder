import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export default class BuilderContext {
  content: any = null;
  context: any = {};
  localState: any = undefined;
  rootSetState() {}
  rootState: any = {};
  apiKey: any = null;
  apiVersion: any = undefined;
  componentInfos: any = {};
  inheritedStyles: any = {};
  BlocksWrapper: any = "div";
  BlocksWrapperProps: any = {};
  nonce: any = "";

  constructor() {}
}
