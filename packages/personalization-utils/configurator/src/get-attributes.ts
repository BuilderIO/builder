import { createAdminApiClient } from '@builder.io/admin-sdk';

export const getAttributes = async (privateKey: string) => {
  const adminSDK = createAdminApiClient(privateKey);
  const res = await adminSDK.query({
    settings: true,
  });
  return res.data?.settings.customTargetingAttributes;
};
