import { registerCommercePlugin, Resource } from '@builder.io/commerce-plugin-tools';
import pkg from '../package.json';
import { getRecommenders } from './api';
/**
 * 
parameters: {
    einsteinId: '1ea06c6e-c936-4324-bcf0-fada93f83bb1',
    einsteinSiteId: 'aaij-MobileFirst'
}
 */

registerCommercePlugin(
  {
    name: 'Einstein',
    id: pkg.name,
    noPreviewTypes: true,
    settings: [
      {
        name: 'einsteinId',
        friendlyName: 'Einstein API Client ID',
        type: 'string',
      },
      {
        name: 'einsteinSiteId',
        friendlyName: 'Einstein API Site ID',
        type: 'string',
      },
    ],
    ctaText: `Connect your Salesforce Einstein API`,
  },
  async settings => {
    const einsteinId = settings.get('einsteinId');
    const einsteinSiteId = settings.get('einsteinSiteId');
    const recommenders = await getRecommenders(einsteinSiteId, einsteinId);

    return {
      recommender: {
        search(search = '') {
          return Promise.resolve(recommenders.filter(rec => JSON.stringify(rec).includes(search)));
        },
        findById(id: string) {
          return Promise.resolve(recommenders.find(rec => rec.id === id) as Resource);
        },
        getRequestObject(id: string) {
          // todo update type
          return id as any;
        },
      },
    };
  }
);
