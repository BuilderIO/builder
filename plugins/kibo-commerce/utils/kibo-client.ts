import currency from 'currency.js';

type PerformSearchParams = {
  gqlQuery: string;
  query?: string;
  filter: string;
  pageSize?: number;
  startIndex?: number;
};
type KiboConfig = {
  apiHost: string;
  authHost: string;
  clientId: string;
  sharedSecret: string;
};

export const productSearchQuery = /* GraphQL */ `
  query Search($query: String, $filter: String, $pageSize: Int, $startIndex: Int) {
    searchResult: productSearch(
      query: $query
      filter: $filter
      pageSize: $pageSize
      startIndex: $startIndex
    ) {
      items {
        productCode
        content {
          productName
          productShortDescription
          productImages {
            imageUrl
          }
        }
        price {
          price
        }
      }
      totalCount
      pageSize
      startIndex
    }
  }
`;

export const categorySearchQuery = /* GraphQL */ `
  query getCategories($filter: String) {
    searchResult: categories(filter: $filter) {
      items {
        categoryCode
        content {
          name
          slug
          categoryImages {
            imageUrl
          }
        }
      }
    }
  }
`;

export class APIAuthenticationHelper {
  _clientId;
  _sharedSecret;
  _authHost;
  _cacheKey;
  _cache;
  authData;

  constructor(
    clientId: string,
    sharedSecret: string,
    authHost: string,
    cacheKey: string,
    cache: any
  ) {
    this._clientId = clientId;
    this._sharedSecret = sharedSecret;
    this._authHost = authHost;
    this._cacheKey = cacheKey;
    this._cache = cache;
    let authTicket = undefined;
    try {
      let serializedAuth = cache.get(cacheKey);
      if (serializedAuth) {
        authTicket = JSON.parse(serializedAuth);
      }
    } catch (error) {}
    this.authData = authTicket;
  }

  _buildFetchOptions(data: any) {
    return {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  }

  _calculateTicketExpiration(kiboAuthTicket: any) {
    //calculate how many milliseconds until auth expires
    const millisecsUntilExpiration = kiboAuthTicket.expires_in * 1000;
    kiboAuthTicket.expires_at = Date.now() + millisecsUntilExpiration;
    return kiboAuthTicket;
  }

  async _getAuthTicket() {
    return this.authData;
  }

  async _setAuthTicket(kiboAuthTicket: any) {
    try {
      this._cache.set(this._cacheKey, JSON.stringify(kiboAuthTicket));
    } catch (error) {}
    this.authData = { ...kiboAuthTicket };
  }

  async authenticate() {
    // create oauth fetch options
    const options = this._buildFetchOptions({
      client_id: this._clientId,
      client_secret: this._sharedSecret,
      grant_type: 'client_credentials',
    });
    // perform authentication
    const authTicket = await (
      await fetch(`https://${this._authHost}/api/platform/applications/authtickets/oauth`, options)
    ).json();
    // set expiration time in ms on auth ticket
    this._calculateTicketExpiration(authTicket);
    // set authentication ticket on next server runtime object
    await this._setAuthTicket(authTicket);

    return authTicket;
  }

  async refreshTicket(kiboAuthTicket: any) {
    // create oauth refresh fetch options
    const options = this._buildFetchOptions({
      client_id: this._clientId,
      client_secret: this._sharedSecret,
      grant_type: 'client_credentials',
      refresh_token: kiboAuthTicket && kiboAuthTicket.refresh_token,
    });
    const response = await fetch(
      `https://${this._authHost}/api/platform/applications/authtickets/oauth`,
      options
    );
    if (response.status >= 400) {
      return this.authenticate();
    }

    const refreshedTicket = await response.json();

    this._calculateTicketExpiration(refreshedTicket);

    await this._setAuthTicket(refreshedTicket);

    return refreshedTicket;
  }

  async getAccessToken() {
    // get current Kibo API auth ticket

    let authTicket = await this._getAuthTicket();
    // if no current ticket, perform auth
    // or if ticket expired, refresh auth
    if (!authTicket) {
      authTicket = await this.authenticate();
    } else if (authTicket.expires_at < Date.now()) {
      authTicket = await this.refreshTicket(authTicket);
    }

    return authTicket.access_token;
  }
}

export class KiboClient {
  graphQLUrl;
  authHelper;
  constructor({ apiHost, authHost, clientId, sharedSecret }: KiboConfig, cache: any) {
    this.graphQLUrl = `https://${apiHost}/graphql`;
    this.authHelper = new APIAuthenticationHelper(
      clientId,
      sharedSecret,
      authHost,
      `${apiHost}_auth`,
      cache
    );
  }

  async getAccessToken() {
    return await this.authHelper.getAccessToken();
  }

  async getHeaders() {
    const authToken = await this.getAccessToken();
    return {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    };
  }

  async performSearch({ gqlQuery, query, filter, pageSize, startIndex }: PerformSearchParams) {
    const headers = await this.getHeaders();
    const body = {
      query: gqlQuery,
      variables: { query, filter, pageSize, startIndex },
    };
    const params = { method: 'POST', ...headers, body: JSON.stringify(body) };
    const request = await fetch(this.graphQLUrl, params);
    const response = await request.json();
    return response.data.searchResult;
  }

  async performProductSearch(searchOptions: any) {
    return await this.performSearch({ gqlQuery: productSearchQuery, ...searchOptions });
  }

  async getItemsByProductCode(items: string[] = []) {
    const filter = items.map(productCode => `productCode eq ${productCode}`).join(' or ');
    try {
      const result = await this.performSearch({ gqlQuery: productSearchQuery, filter });
      return result.items;
    } catch (error) {
      console.error(error);
    }
  }

  async performCategorySearch(searchOptions: any) {
    return await this.performSearch({ gqlQuery: categorySearchQuery, ...searchOptions });
  }

  async getItemsByCategoryCode(items: string[] = []) {
    const filter = items.map(categoryCode => `categoryCode eq ${categoryCode}`).join(' or ');
    try {
      const result = await this.performSearch({ gqlQuery: categorySearchQuery, filter });
      return result.items;
    } catch (error) {
      console.error(error);
    }
  }
}
