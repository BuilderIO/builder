import { Injectable, Inject, Optional } from '@angular/core';
import { RESPONSE, REQUEST } from '@nguniversal/express-engine/tokens';
import { Builder } from '@builder.io/sdk';
import { HttpClient } from '@angular/common/http';
import { Request, Response } from 'express';
import { BuilderContentComponent } from '../components/builder-content/builder-content.component';

export const BUILDER_API_KEY = 'BUILDER_API_KEY'; // new InjectionToken<string>('BUILDER_API_KEY');
export const EXPRESS_REQUEST = 'EXPRESS_REQUEST'; // new InjectionToken<Request>('EXPRESS_REQUEST');
export const EXPRESS_RESPONSE = 'EXPRESS_RESPONSE'; // new InjectionToken<Response>('EXPRESS_RESPONSE');

@Injectable()
export class BuilderService extends Builder {
  static componentInstances: { [modelName: string]: BuilderContentComponent | undefined } = {};

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
    @Optional() private http: HttpClient
  ) {
    super(apiKey, expressEngineRequest || expressRequest, expressEngineResponse || expressResponse);

    if (this.expressEngineRequest) {
      this.expressRequest = this.expressEngineRequest;
    }

    if (this.expressRequest) {
      this.request = this.expressRequest;
    }

    if (this.expressEngineResponse) {
      this.expressResponse = this.expressEngineResponse;
    }

    if (this.expressResponse) {
      this.response = this.expressResponse;
    }

    if (apiKey) {
      this.init(apiKey);
    }

    if (!Builder.isBrowser && !this.request) {
      console.warn(
        'No express request set! Builder cannot target appropriately without this, ' +
          'please contact help@builder.io to learn how to set this as required'
      );
    }
  }

  // (override)
  requestUrl(url: string) {
    if (this.http) {
      return this.http.get(url).toPromise();
    } else {
      return super.requestUrl(url);
    }
  }
}
