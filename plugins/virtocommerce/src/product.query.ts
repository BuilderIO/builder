export function productRequest(storeId: string, locale: string, productId: string) {
  const query = `
        query GetProduct($storeId: String!, $currencyCode: String!, $cultureName: String, $id: String!) {
            product(storeId: $storeId, id: $id, currencyCode: $currencyCode, cultureName: $cultureName) {
                name
                id
                code
                slug
                outline
                hasVariations
                minQuantity
                maxQuantity
                imgSrc
                images {
                    url
                }
                assets {
                    name
                    url
                }
                description {
                    content
                    id
                }
                descriptions {
                    content
                    id
                }
                properties {
                    name
                    value
                    type
                    hidden
                    valueType
                    label
                }
                variations {
                    id
                    name
                    images {
                        url
                    }
                    minQuantity
                    maxQuantity
                    code
                    properties {
                        name
                        value
                        type
                    }                
                }
            }
        }
`;
  const request = {
    operationName: 'GetProduct',
    variables: { storeId: storeId, cultureName: locale, currencyCode: 'USD', id: productId },
    query: query,
  };
  return request;
}
