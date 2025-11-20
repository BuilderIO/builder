import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

import { firstValueFrom, retry } from "rxjs";

import {
  GetContentOptions,
  fetchEntries,
  fetchOneEntry,
} from "@builder.io/sdk-angular";

@Injectable({ providedIn: "root" })
export class BuilderContentService {
  http = inject(HttpClient);

  fetchOneEntry(options: GetContentOptions) {
    return fetchOneEntry({ ...options, fetch: httpClientFetch(this.http) });
  }

  fetchEntries(options: GetContentOptions) {
    return fetchEntries({ ...options, fetch: httpClientFetch(this.http) });
  }
}

/**
 * Fetches content from Builder.io using Angular's HttpClient
 * so that results are transferred from server to client.
 */
function httpClientFetch(http: HttpClient) {
  return async (url: string, init: any) => {
    const headers = init?.headers;
    const resp = await firstValueFrom(
      http
        .get(url, { observe: "response", responseType: "text", headers })
        .pipe(retry(3)),
    );

    const headersInit: HeadersInit = {};
    resp.headers.keys().forEach((key) => {
      const val = resp.headers.get(key);
      if (val) {
        headersInit[key] = val;
      }
    });

    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: headersInit,
    });
  };
}
