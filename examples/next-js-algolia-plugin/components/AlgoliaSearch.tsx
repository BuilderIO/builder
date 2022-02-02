import builder, { BuilderContent } from "@builder.io/react";
import algoliasearch, { SearchClient } from "algoliasearch/lite";
import Head from "next/head";
import { Children, cloneElement, isValidElement, useEffect, useState } from "react";
import { InstantSearch, Hits, Highlight } from "react-instantsearch-dom";

export function AlgoliaSearch({
  applicationId,
  searchApiKey,
  indexName,
  children,
}: {
  applicationId: string;
  searchApiKey: string;
  indexName: string;
  children?: JSX.Element;
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
                {children}
              </InstantSearch>
            </>
          )}
        </>
      )}
    </>
  );
}

export function AlgoliaHits({ children }: { children?: JSX.Element }) {
  return (
    <Hits
      hitComponent={({ hit }: { hit: any }) => {
        const childrenWithProps = Children.map(children, child => {
          if (isValidElement(child)) {
            const props = child.props as any;
            props.block.children.map((c: any) => {
              if (c.component.name === "AlgoliaHighlight") {
                c.component.options.hit = hit;
              }
            });
            return cloneElement(child, (hit = hit));
          }
          return child;
        });
        return (
          <>
            {/* <Highlight attribute="data.title" hit={hit} />
            <Highlight attribute="data.description" hit={hit} /> */}
            {childrenWithProps}
          </>
        );
      }}
    />
  );
}
