import React from 'react';

export interface RequestInfo {
  promise: Promise<any>;
  url?: string;
}

export type RequestOrPromise = RequestInfo | Promise<any>;

export const isPromise = (thing: RequestOrPromise): thing is Promise<any> =>
  typeof (thing as any).then === 'function';
export const isRequestInfo = (thing: RequestOrPromise): thing is RequestInfo => !isPromise(thing);

export const BuilderAsyncRequestsContext = React.createContext({
  requests: [] as RequestOrPromise[],
  errors: [] as Error[],
  logs: [] as string[],
});
