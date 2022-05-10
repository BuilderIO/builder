import { Builder, builder } from '@builder.io/sdk';
import { getUserAttributes } from './utils';

export const initUserAttributes = (cookiesMap: Record<string, string>) => {
  if (Builder.isBrowser) {
    const targeting = getUserAttributes(cookiesMap);
    builder.setUserAttributes(targeting);
  }
};
