// https://shopify.dev/docs/api/customer/latest/objects/Order
export const ORDER_ITEM_FRAGMENT = `#graphql
  fragment OrderItem on Order {
    totalPrice {
      amount
      currencyCode
    }
    financialStatus
    fulfillments(first: 1) {
      nodes {
        status
      }
    }
    id
    number
    processedAt
  }
` as const;

// https://shopify.dev/docs/api/customer/latest/objects/Customer
export const CUSTOMER_ORDERS_FRAGMENT = `#graphql
  fragment CustomerOrders on Customer {
    orders(
      sortKey: PROCESSED_AT,
      reverse: true,
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...OrderItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        endCursor
        startCursor
      }
    }
  }
  ${ORDER_ITEM_FRAGMENT}
` as const;

// https://shopify.dev/docs/api/customer/latest/queries/customer
export const CUSTOMER_ORDERS_QUERY = `#graphql
  ${CUSTOMER_ORDERS_FRAGMENT}
  query CustomerOrders(
    $endCursor: String
    $first: Int
    $last: Int
    $startCursor: String
  ) {
    customer {
      ...CustomerOrders
    }
  }
` as const;
