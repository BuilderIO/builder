import appState from '@builder.io/app-context';
import { Resource } from '@builder.io/plugin-tools';

const basicCache = new Map();

const transformProduct = (resource: any) => ({
  ...resource,
  id: resource.id as any,
  title: resource.name || 'untitled',
  handle: resource.id,
  image: {
    src:
      resource.imageGroups?.[0].images?.[0].link ||
      'https://unpkg.com/css.gg@2.0.0/icons/svg/toolbox.svg',
  },
});

const transformHit = (hit: any) => ({
  id: hit.productId as any,
  title: hit.productName || 'untitled',
  handle: hit.productId,
  image: {
    src: hit.image?.link || 'https://unpkg.com/css.gg@2.0.0/icons/svg/toolbox.svg',
  },
});

const transformCategory = (cat: any) => ({
  id: cat.id,
  title: cat.name,
  handle: cat.id,
  image: {
    src: cat.image || 'https://unpkg.com/css.gg@2.0.0/icons/svg/box.svg',
  },
});

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

export class Api {
  getBaseUrl(path: string, search = {}) {
    const params = new URLSearchParams({
      ...search,
      pluginId: this.pluginId,
      apiKey: this.apiKey,
    });
    const root = appState.config.apiRoot();
    const baseUrl = new URL(`${root}/api/v1/sfcc-commerce/${path}`);
    baseUrl.search = params.toString();
    return baseUrl.toString();
  }

  constructor(private apiKey: string, private pluginId: string) {}

  async request(path: string, config?: RequestInit, search = {}) {
    try {
      const response = await fetch(`${this.getBaseUrl(path, search)}`, {
        ...config,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  getProduct(id: string): Promise<any> {
    if (basicCache.get(id)) {
      return Promise.resolve(basicCache.get(id));
    }
    return this.request(`products/${id}`).then(product => {
      const resource = transformProduct(product);
      basicCache.set(resource.id, resource);
      return resource;
    });
  }

  search(search: string): Promise<Resource[]> {
    return this.request('products-search', { method: 'GET' }, { q: search }).then(search => {
      const resources = search.hits?.map(transformHit) || [];
      resources.forEach((r: Resource) => basicCache.set(r.id, r));
      return resources;
    });
  }

  getCategory(id: string): Promise<Resource> {
    if (basicCache.get(id)) {
      return Promise.resolve(basicCache.get(id));
    }
    return this.request(`categories/${id}`).then(cat => {
      const resource = transformProduct(cat);
      basicCache.set(resource.id, resource);
      return resource;
    });
  }

  async searchCategories(search: string): Promise<Resource[]> {
    try {
      const categories = await this.request('categories-search', { method: 'GET' }, { q: search });
      const resources = categories?.map(transformCategory) || [];
      resources.forEach((r: Resource) => basicCache.set(r.id, r));
      return resources;
    } catch (e) {
      throw e;
    }
  }
}
