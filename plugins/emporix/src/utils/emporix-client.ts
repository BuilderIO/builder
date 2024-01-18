export class AnonymousTokenHelper {
  _tenant: string;
  _clientId: string;
  _cache: any;

  constructor(tenant: string, clientId: string) {
    this._tenant = tenant;
    this._clientId = clientId;
    this._cache = {};
  }

  async getAnonymousToken() {
    if (!this._cache['access_token']) {
      await this.authenticate();
    }
    if (this._cache['expires_at'] < Date.now()) {
      await this.authenticate();
    }
    return this._cache['access_token'];
  }

  clearCache() {
    this._cache = {};
  }

  async authenticate() {
    const response = await fetch(
      `https://api.emporix.io/customerlogin/auth/anonymous/login?client_id=${this._clientId}&tenant=${this._tenant}`
    );
    const data = await response.json();
    data['expires_at'] = Date.now() + 1000 * data['expires_in'];
    this._cache = data;
  }
}

export class EmporixClient {
  anonymousTokenHelper: AnonymousTokenHelper;
  _tenant: string;
  constructor(tenant: string, clientId: string) {
    this._tenant = tenant;
    this.anonymousTokenHelper = new AnonymousTokenHelper(tenant, clientId);
  }

  async searchProducts(search: string) {
    const response = await this._executeRequest(
      `https://api.emporix.io/product/${this._tenant}/products?q=name:~${search}`,
      {}
    );
    return await response.json();
  }

  async getProduct(id: string) {
    const response = await this._executeRequest(
      `https://api.emporix.io/product/${this._tenant}/products/${id}`,
      {}
    );
    return await response.json();
  }

  getProductUrl(id: string) {
    return `https://api.emporix.io/product/${this._tenant}/products/${id}`;
  }

  async getHeaders() {
    const token = await this.anonymousTokenHelper.getAnonymousToken();
    const headers = {
      Authorization: `Bearer ${token}`,
      'X-Version': 'v2',
    };
    return headers;
  }

  getHeadersFromCache() {
    const token = this.anonymousTokenHelper._cache['access_token'];
    const headers = {
      Authorization: `Bearer ${token}`,
      'X-Version': 'v2',
    };
    return headers;
  }

  async searchCategories(search: string) {
    const response = await this._executeRequest(
      `https://api.emporix.io/category/${this._tenant}/categories?localizedName=${search}`,
      { 'X-Version': 'v2' }
    );
    return await response.json();
  }

  async getCategoryById(id: string) {
    const response = await this._executeRequest(
      `https://api.emporix.io/category/${this._tenant}/categories/${id}`,
      { 'X-Version': 'v2' }
    );
    return await response.json();
  }

  async getCategoryByCode(code: string) {
    const response = await this._executeRequest(
      `https://api.emporix.io/category/${this._tenant}/categories?code=${code}`,
      { 'X-Version': 'v2' }
    );
    return await response.json();
  }

  getCategoryUrl(id: string) {
    return `https://api.emporix.io/category/${this._tenant}/categories/${id}`;
  }

  async _executeRequest(url: string, headers: any) {
    const token = await this.anonymousTokenHelper.getAnonymousToken();
    headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, {
      headers: headers,
    });
    if (response.status === 401) {
      this.anonymousTokenHelper.clearCache();
    }
    return response;
  }
}
