import appState from '@builder.io/app-context';
import { Resource } from '@builder.io/commerce-plugin-tools';

type Recommender = {
  name: string;
  description: string;
  recommenderType: string;
};

const transformRecommender = (rec: Recommender) => ({
  ...rec,
  id: rec.name,
  title: rec.name,
  image: {
    src: 'https://cdn.builder.io/api/v1/image/assets%2Fd1ed12c3338144da8dd6b63b35d14c30%2Fe1439f0d991c4e2d968c84a38059f1d2',
  },
});

export const getRecommenders = (siteId: string, clientId: string): Promise<Array<Resource>> => {
  const url = new URL('https://cdn.builder.io/api/v1/proxy-api');
  url.searchParams.set(
    'url',
    `https://api.cquotient.com/v3/personalization/recommenders/${siteId}`
  );
  url.searchParams.set('headers.x-cq-client-id', clientId);
  url.searchParams.set('apiKey', appState.user.apiKey);
  return fetch(url)
    .then(res => res.json())
    .then(res => res.recommenders.map(transformRecommender));
};
