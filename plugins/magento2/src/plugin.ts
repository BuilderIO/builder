import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import pkg from '../package.json';
import { getAPI } from './service';

registerCommercePlugin(
  {
    name: 'Magento',
    id: pkg.name,
    settings: [
      {
        name: 'storeUrl',
        type: 'string',
        required: true,
      },
    ],
    ctaText: `Connect your Magento2 Store`,
  },
  async settings => {
    const storeUrl = new URL(settings.get('storeUrl')).origin;

    return getAPI(storeUrl);
  }
);
