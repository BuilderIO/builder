import { beforeAll, beforeEach, describe, it } from '@jest/globals';
import { by, device, element, expect } from 'detox';
import { openApp } from './utils/openApp';

describe('Example', () => {
  beforeAll(async () => {
    await openApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show header', async () => {
    await expect(element(by.text('SDK Feature testing project'))).toBeVisible();
  });
});
