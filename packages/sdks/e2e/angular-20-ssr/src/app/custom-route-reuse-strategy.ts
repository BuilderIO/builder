import { BaseRouteReuseStrategy } from "@angular/router";

export class CustomRouteReuseStrategy extends BaseRouteReuseStrategy {
  override shouldReuseRoute() {
    return false;
  }
}
