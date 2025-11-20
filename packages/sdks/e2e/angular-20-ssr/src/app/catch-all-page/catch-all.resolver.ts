import { LOCALE_ID, inject } from "@angular/core";
import type { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";

import {
  type BuilderContent,
  getBuilderSearchParams,
} from "@builder.io/sdk-angular";

import { BuilderContentService } from "../builder-content.service";

export const catchAllResolver: ResolveFn<
  BuilderContent | Error | null
> = async (route: ActivatedRouteSnapshot) => {
  const apiKey = "bc692bc2e70e4774b3065ec0248cb7a9";
  const builder = inject(BuilderContentService);
  const locale = inject(LOCALE_ID);

  const urlPath = `/${route.url.join("/")}`;
  const searchParams = getBuilderSearchParams(route.queryParams);

  let content = await builder.fetchOneEntry({
    apiKey,
    model: "page",
    userAttributes: {
      urlPath,
    },
    options: {
      ...searchParams,
      locale,
    },
  });

  return content;
};
