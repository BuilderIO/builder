import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BuilderFetchService {
  private http = inject(HttpClient);

  // SSR-compatible fetch function
  fetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    try {
      const response = await firstValueFrom(
        this.http.request<any>(options.method || 'GET', url, {
          body: options.body,
          headers: options.headers as any,
          ...options,
          observe: 'response',
          responseType: 'json',
        })
      );

      // Convert Angular HttpHeaders to Web API Headers
      const headersObj: Record<string, string> = {};
      response.headers.keys().forEach((key: string) => {
        headersObj[key] = response.headers.get(key) || '';
      });

      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        statusText: response.statusText || '',
        headers: new Headers(headersObj),
        json: () => Promise.resolve(response.body),
      } as Response;
    } catch (error) {
      console.error('Error in BuilderFetchService:', error);
      // Return a failed response instead of throwing
      return {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers(),
        json: () => Promise.reject(error),
      } as Response;
    }
  };
}
