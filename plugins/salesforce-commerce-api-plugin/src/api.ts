export class Api {
  getBaseUrl(path: string, search = {}) {
    const params = new URLSearchParams({
      ...search,
      pluginId: this.pluginId,
      apiKey: this.apiKey,
    });
    const root = 'http://localhost:4000'; // todo appState.config.apiRoot();
    const baseUrl = new URL(`${root}/api/v1/sfcc-commerce/${path}`);
    baseUrl.search = params.toString();
    return baseUrl.toString();
  }

  constructor(private apiKey: string, private pluginId: string) {}

  request(path: string, config?: RequestInit, search = {}) {
    return fetch(`${this.getBaseUrl(path, search)}`, {
      ...config,
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => res.json());
  }

  getProduct(id: string): Promise<any> {
    return this.request(`products/${id}`);
  }

  search(search: string, refine?: string): Promise<any> {
    return this.request('products-search', { method: 'GET' }, { q: search });
  }

  getCategory(id: string): Promise<any> {
    return this.request(`categories/${id}`);
  }

  searchCategories(search: string): Promise<any> {
    return this.request('categories-search', { method: 'GET' }, { q: search });
  }
}
