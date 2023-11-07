export function categoryRequest(storeId: string, locale: string, id: string) {
  const query = `
        query Category($storeId: String!, $cultureName: String, $id: String!) {
            category(
                storeId: $storeId
                cultureName: $cultureName
                id: $id
            ) {
                id
                name
                imgSrc
            }
        }
    `;
  const request = {
    operationName: 'Category',
    variables: {
      cultureName: locale,
      storeId: storeId,
      id: id,
    },
    query: query,
  };
  return request;
}
