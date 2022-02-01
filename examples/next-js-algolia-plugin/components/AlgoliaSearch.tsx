// Importing modules
import algoliasearch, { SearchClient } from "algoliasearch/lite";
import Head from "next/head";
import { useEffect, useState } from "react";
import { InstantSearch, SearchBox, Hits, Highlight } from "react-instantsearch-dom";

// if (!process.env.ALGOLIA_APPLICATION_ID || !process.env.ALGOLIA_SEARCH_ONLY_API_KEY) {
//   throw new Error(
//     "Missing env variable ALGOLIA_APPLICATION_ID or ALGOLIA_SEARCH_ONLY_API_KEY check next.config.js"
//   );
// }
// const searchClient = algoliasearch(
//   process.env.ALGOLIA_APPLICATION_ID,
//   process.env.ALGOLIA_SEARCH_ONLY_API_KEY
// );

export function AlgoliaSearch({
  applicationId,
  searchApiKey,
  indexName,
}: {
  applicationId: string;
  searchApiKey: string;
  indexName: string;
}) {
  const [algoliaConfig, setAlgoliaConfig] = useState<null | {
    applicationId: string;
    searchApiKey: string;
    indexName: string;
  }>(null);
  const [searchClient, setSearchClient] = useState<null | SearchClient>(null);
  useEffect(() => {
    if (applicationId && searchApiKey && indexName) {
      setAlgoliaConfig({ applicationId, searchApiKey, indexName });
    }
  }, [applicationId, searchApiKey, indexName]);

  useEffect(() => {
    if (algoliaConfig?.applicationId && algoliaConfig?.searchApiKey && algoliaConfig?.indexName) {
      setSearchClient(algoliasearch(algoliaConfig.applicationId, algoliaConfig.searchApiKey));
    }
  }, [algoliaConfig]);

  return (
    <>
      {!searchClient || !algoliaConfig?.indexName ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexWrap: "wrap",
            alignContent: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              color: "red",
              fontWeight: 700,
              display: "flex",
              flexDirection: "column",
              flexWrap: "wrap",
              alignContent: "center",
              justifyContent: "center",
            }}
          >
            <p>Missing Keys: Select this component in Builder.io. </p>
          </div>
          <p style={{ fontWeight: 700 }}>Open Options tab and set all the keys.</p>
          <p>applicationId</p>
          <p>searchApiKey</p>
          <p>indexName</p>
        </div>
      ) : (
        <>
          {algoliaConfig?.indexName && (
            <>
              <Head>
                <link
                  rel="stylesheet"
                  href="https://cdn.jsdelivr.net/npm/instantsearch.css@7/themes/algolia-min.css"
                />
              </Head>
              <InstantSearch searchClient={searchClient} indexName={algoliaConfig?.indexName}>
                {/* Adding Search Box */}
                <SearchBox />

                {/* Adding Data */}
                <Hits hitComponent={Hit} />
              </InstantSearch>
            </>
          )}
        </>
      )}
    </>
  );
}
function Hit({ hit }: { hit: any }) {
  console.log(`desc: ${hit.data.description}`, hit);
  return (
    <article>
      <h2>
        <Highlight attribute="data.title" hit={hit} />
      </h2>
      <Highlight attribute="data.description" hit={hit} />
    </article>
  );
}
