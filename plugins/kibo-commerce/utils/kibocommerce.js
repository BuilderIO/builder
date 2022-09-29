import currency from 'currency.js';

export const productSearchQuery = /* GraphQL */ `
  query Search($query: String, $filter: String, $pageSize: Int, $startIndex: Int) {
   searchResult: productSearch(query: $query, filter: $filter, pageSize: $pageSize, startIndex: $startIndex) {
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

  constructor(clientId, sharedSecret, authHost, cacheKey, cache) {
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

  _buildFetchOptions(data) {
    return {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  }

  _calculateTicketExpiration(kiboAuthTicket) {
    //calculate how many milliseconds until auth expires
    const millisecsUntilExpiration = kiboAuthTicket.expires_in * 1000;
    kiboAuthTicket.expires_at = Date.now() + millisecsUntilExpiration;
    return kiboAuthTicket;
  }

  async _getAuthTicket() {
    return this.authData;
  }

  async _setAuthTicket(kiboAuthTicket) {
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

  async refreshTicket(kiboAuthTicket) {
    // create oauth refresh fetch options
    const options = this._buildFetchOptions({
      client_id: this._clientId,
      client_secret: this._sharedSecret,
      grant_type: 'client_credentials',
      refresh_token: kiboAuthTicket && kiboAuthTicket.refresh_token,
    });
    const refreshedTicket = await (
      await fetch(`https://${this._authHost}/api/platform/applications/authtickets/oauth`, options)
    ).json();

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

export class KiboCommerce {
  graphQLUrl;
  authHelper;
  constructor({ apiHost, authHost, clientId, sharedSecret, applicationId }, cache) {
    this.graphQLUrl = `https://${apiHost}/graphql`;
    this.authHelper = new APIAuthenticationHelper(
      clientId || applicationId,
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

  async performSearch({ gqlQuery, query, filter, pageSize, startIndex }) {
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

  async performProductSearch(searchOptions){
     return await this.performSearch({gqlQuery:productSearchQuery, ...searchOptions})
  }

  async getItemsByProductCode(items = []) {
    const filter = items.map(productCode => `productCode eq ${productCode}`).join(' or ');
    try {
      const result = await this.performSearch({gqlQuery:productSearchQuery, filter });
      return result.items;
    } catch (error) {
      console.error(error);
    }
  }

  async perfromCategorySearch(searchOptions){
     return await this.performSearch({gqlQuery:categorySearchQuery, ...searchOptions})
  }

  async getItemsByCategoryCode(items = []) {
    const filter = items.map(categoryCode => `categoryCode eq ${categoryCode}`).join(' or ');
    try {
      const result = await this.performSearch({gqlQuery:categorySearchQuery, filter });
      return result.items;
    } catch (error) {
      console.error(error);
    }
  }
}
