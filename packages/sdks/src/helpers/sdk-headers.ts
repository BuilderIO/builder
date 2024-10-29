import { SDK_VERSION } from '../constants/sdk-version.js';
import { TARGET } from '../constants/target.js';

export const getSdkHeaders = () => ({
  'X-Builder-SDK': TARGET,
  'X-Builder-SDK-GEN': '2',
  'X-Builder-SDK-Version': SDK_VERSION,
});
