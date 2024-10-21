import { SDK_VERSION } from '../constants/sdk-version';
import { TARGET } from '../constants/target';

export const getSdkHeaders = () => ({
  'X-Builder-SDK': TARGET,
  'X-Builder-SDK-GEN': '2',
  'X-Builder-SDK-Version': SDK_VERSION,
});
