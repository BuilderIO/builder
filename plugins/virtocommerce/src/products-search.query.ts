export function searchProductsRequest(storeId: string, locale: string, search: string) {
  const query = `
        query SearchProducts($storeId: String!, $cultureName: String, $after: String, $first: Int, $query: String) {
            products(
                storeId: $storeId
                after: $after
                first: $first
                cultureName: $cultureName
                query: $query
            ) {
                items {
                    name
                    id
                    code
                    productType
                    vendor {
                        id
                        name
                    }
                    imgSrc
                }
            }
        }
`;

  const request = {
    operationName: 'SearchProducts',
    variables: {
      storeId: storeId,
      cultureName: locale,
      query: search,
      first: 5,
      after: '0',
    },
    query: query,
  };
  return request;
}
