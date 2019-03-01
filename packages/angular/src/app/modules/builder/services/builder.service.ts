import { Injectable, Inject, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { RESPONSE, REQUEST } from '@nguniversal/express-engine/tokens';
import { Builder } from '@builder.io/sdk';
import { parse, Url } from 'url';
import { HttpClient } from '@angular/common/http';
import { Request, Response } from 'express';
import Cookies from '../classes/cookies';
import { BuilderContentComponent } from '../components/builder-content/builder-content.component';

export const BUILDER_API_KEY = 'BUILDER_API_KEY'; // new InjectionToken<string>('BUILDER_API_KEY');
export const EXPRESS_REQUEST = 'EXPRESS_REQUEST'; // new InjectionToken<Request>('EXPRESS_REQUEST');
export const EXPRESS_RESPONSE = 'EXPRESS_RESPONSE'; // new InjectionToken<Response>('EXPRESS_RESPONSE');

@Injectable()
export class BuilderService extends Builder {
  static componentInstances: { [modelName: string]: BuilderContentComponent | undefined } = {};

  private cookies: Cookies | null = null;

  autoTrack = !this.isDevelopment;

  // TODO: set this for QA
  private get isDevelopment() {
    // Automatic determining of development environment
    return (
      Builder.isIframe ||
      (Builder.isBrowser && (location.hostname === 'localhost' || location.port !== ''))
    );
  }

  constructor(
    @Optional()
    @Inject(BUILDER_API_KEY)
    apiKey: string,
    @Optional()
    @Inject(EXPRESS_REQUEST)
    private expressRequest: Request,
    @Optional()
    @Inject(REQUEST)
    private expressEngineRequest: Request,
    @Optional()
    @Inject(EXPRESS_RESPONSE)
    private expressResponse: Response,
    @Optional()
    @Inject(RESPONSE)
    private expressEngineResponse: Response,
    private router: Router,
    @Optional() private http: HttpClient
  ) {
    super();

    if (this.expressEngineRequest) {
      this.expressRequest = this.expressEngineRequest;
    }

    if (this.expressEngineResponse) {
      this.expressResponse = this.expressEngineResponse;
    }

    if (apiKey) {
      this.init(apiKey);
    }

    if (this.expressRequest) {
      this.setUserAgent(this.expressRequest.get('user-agent') as string || '');
      this.cookies = new Cookies(this.expressRequest, this.expressResponse);
    } else if (!Builder.isBrowser) {
      console.warn(
        'No express request set! Builder cannot target appropriately without this, ' +
          'please contact steve@builder.io to learn how to set this as required'
      );
    }
  }

  // (override)
  getLocation(): Url {
    if (Builder.isBrowser && !this.router) {
      return super.getLocation();
    }
    return parse(this.router.url);
  }

  // (override)
  requestUrl(url: string) {
    if (this.http) {
      return this.http.get(url).toPromise();
    } else {
      return super.requestUrl(url);
    }
  }

  // (override)
  protected getCookie(name: string) {
    if (Builder.isBrowser) {
      return super.getCookie(name);
    } else {
      return this.cookies && this.cookies.get(name);
    }
  }

  // (override)
  protected setCookie(name: string, value: any, options: any) {
    if (Builder.isBrowser) {
      return super.setCookie(name, value, options);
    } else {
      if (this.cookies) {
        this.cookies.set(name, value, {
          secure: this.getLocation().protocol === 'https:',
          ...(options instanceof Date ? { expires: options } : options),
        });
      }
    }
  }
}
