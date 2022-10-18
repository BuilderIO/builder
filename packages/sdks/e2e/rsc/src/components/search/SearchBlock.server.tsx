import { gql, useLocalization, useShopQuery, useUrl } from '@shopify/hydrogen';

import type { Collection } from '@shopify/hydrogen/storefront-api-types';
import { ProductGrid, Section } from '~/components';
import { PRODUCT_CARD_FRAGMENT } from '~/lib/fragments';

export function SearchBlock({
  search,
  count,
}: {
  search: string;
  count: number;
}) {
  const {
    language: { isoCode: languageCode },
    country: { isoCode: countryCode },
  } = useLocalization();

  const { searchParams } = useUrl();

  const searchTerm = search;

  const { data } = useShopQuery<any>({
    query: SEARCH_QUERY,
    variables: {
      pageBy: count,
      country: countryCode,
      language: languageCode,
      searchTerm,
    },
    preload: true,
  });

  const products = data?.products;

  return (
    <Section>
      <ProductGrid
        key="search"
        url={`/search?country=${countryCode}&q=${searchTerm}`}
        collection={{ products } as Collection}
      />
    </Section>
  );
}

const SEARCH_QUERY = gql`
  ${PRODUCT_CARD_FRAGMENT}
  query search(
    $searchTerm: String
    $country: CountryCode
    $language: LanguageCode
    $pageBy: Int!
    $after: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $pageBy
      sortKey: RELEVANCE
      query: $searchTerm
      after: $after
    ) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;
