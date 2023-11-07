export function searchCategoriesRequest(storeId: string, locale: string, search: string) {
  const query = `
        query Categories($storeId: String!, $cultureName: String, $after: String, $first: Int, $filter: String, $query: String) {
            categories(
                storeId: $storeId
                after: $after
                first: $first
                cultureName: $cultureName
                filter: $filter
                query: $query
            ) {
                items {
                    id
                    name
                    slug
                    imgSrc
                }
            }
        }
    `;
  const request = {
    operationName: 'Categories',
    variables: {
      after: '0',
      cultureName: locale,
      filter: 'status:visible',
      first: 10,
      storeId: storeId,
      query: search,
    },
    query: query,
  };
  return request;
}
