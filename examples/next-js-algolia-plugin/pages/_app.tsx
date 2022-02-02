import "../styles/globals.css";

import type { AppProps } from "next/app";
import { builder, Builder, withChildren } from "@builder.io/react";
import { AlgoliaSearch, AlgoliaHits } from "../components/AlgoliaSearch";
import { Highlight, SearchBox } from "react-instantsearch-dom";

if (!process.env.BUILDER_PUBLIC_KEY) {
  throw new Error("Missing env variable BUILDER_PUBLIC_KEY check next.config.js");
}

// Initialize once builder with the apiKey
builder.init(process.env.BUILDER_PUBLIC_KEY);

// Register AlgoliaSearch components so they are available in the drag-and-drop tool
Builder.registerComponent(withChildren(AlgoliaSearch), {
  name: "AlgoliaSearch",
  image:
    "https://cdn.builder.io/api/v1/image/assets%2F6314dcbfce4d40698c53786a58829190%2Fbe6e323ed7334c088deb2989288fb7e3",
  canHaveChildren: true,
  inputs: [
    {
      name: "applicationId",
      type: "string",
    },
    {
      name: "searchApiKey",
      type: "string",
    },
    {
      name: "indexName",
      type: "string",
    },
  ],
});

Builder.registerComponent(SearchBox, {
  name: "AlgoliaSearchBox",
  image:
    "https://cdn.builder.io/api/v1/image/assets%2F6314dcbfce4d40698c53786a58829190%2Fbe6e323ed7334c088deb2989288fb7e3",
});

Builder.registerComponent(withChildren(AlgoliaHits), {
  name: "AlgoliaHits",
  image:
    "https://cdn.builder.io/api/v1/image/assets%2F6314dcbfce4d40698c53786a58829190%2Fbe6e323ed7334c088deb2989288fb7e3",
  canHaveChildren: true,
  inputs: [
    {
      name: "applicationId",
      type: "string",
    },
    {
      name: "searchApiKey",
      type: "string",
    },
    {
      name: "indexName",
      type: "string",
    },
  ],
});

Builder.registerComponent(Highlight, {
  name: "AlgoliaHighlight",
  image:
    "https://cdn.builder.io/api/v1/image/assets%2F6314dcbfce4d40698c53786a58829190%2Fbe6e323ed7334c088deb2989288fb7e3",
  inputs: [
    {
      name: "attribute",
      type: "string",
    },
  ],
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
