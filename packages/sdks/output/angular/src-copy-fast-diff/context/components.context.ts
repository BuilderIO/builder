import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export default class ComponentsContext {
  registeredComponents: any = {};

  constructor() {}
}
