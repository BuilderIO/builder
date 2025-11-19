import { HttpClient, type HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BuilderFetchService {
  private http = inject(HttpClient);

  // SSR-compatible fetch function
  fetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    return firstValueFrom(
      this.http.request<any>(options.method || 'GET', url, {
        body: options.body,
        headers: options.headers as any,
        ...options,
        observe: 'response',
        responseType: 'json',
      })
    ).then((response: HttpResponse<any>) => {
      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        json: () => Promise.resolve(response.body),
      } as Response;
    });
  };
}
