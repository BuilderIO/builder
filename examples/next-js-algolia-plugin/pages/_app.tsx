import "../styles/globals.css";

import type { AppProps } from "next/app";
import { builder, Builder, withChildren } from "@builder.io/react";
import { Header } from "../components/Header";
import { ShoesViewer } from "../components/ShoesViewer";
import { SourceCodeLink } from "../components/SourceCodeLink";
import { AlgoliaSearch } from "../components/AlgoliaSearch";
import { SearchBox } from "react-instantsearch-dom";

if (!process.env.BUILDER_PUBLIC_KEY) {
  throw new Error("Missing env variable BUILDER_PUBLIC_KEY check next.config.js");
}

// Initialize once builder with the apiKey
builder.init(process.env.BUILDER_PUBLIC_KEY);

// Register AlgoliaSearch component so it's available in the drag-and-drop tool
Builder.registerComponent(withChildren(AlgoliaSearch), {
  name: "AlgoliaSearch",
  image:
    "https://cdn.builder.io/api/v1/image/assets%2F6314dcbfce4d40698c53786a58829190%2Fbe6e323ed7334c088deb2989288fb7e3",
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

// Register Header component so it's available in the drag-and-drop tool
Builder.registerComponent(Header, {
  name: "Header",
  image:
    "https://cdn.builder.io/api/v1/image/assets%2F6314dcbfce4d40698c53786a58829190%2F55d79cc01709490c8c0bc008ee05db0b",
  inputs: [
    {
      name: "title",
      type: "string",
    },
    {
      name: "subtitle",
      type: "string",
    },
  ],
});

// Register ModelView component as dragable component in the builder editor
Builder.registerComponent(ShoesViewer, {
  name: "Shoes",
  image:
    "https://cdn.builder.io/api/v1/image/assets%2F6314dcbfce4d40698c53786a58829190%2Faa16fd17ba1c49c2973f1e6ccee1be51",
  inputs: [
    {
      name: "nuShoes",
      type: "number",
      friendlyName: "Number of shoes",
      defaultValue: 100,
    },
    {
      name: "ambientLight",
      type: "number",
      friendlyName: "Ambient light intensity",
      defaultValue: 0.5,
    },
  ],
});

// Register ModelView component as dragable component in the builder editor
Builder.registerComponent(withChildren(SourceCodeLink), {
  name: "SourceCodeLink",
  inputs: [
    {
      name: "fileName",
      type: "string",
      required: true,
    },
    {
      name: "line",
      type: "number",
    },
    {
      name: "column",
      type: "number",
    },
  ],
  hideFromInsertMenu: true,
  canHaveChildren: true,
  defaultChildren: [
    {
      "@type": "@builder.io/sdk:Element",
      component: { name: "Text", options: { text: "Open source code" } },
    },
  ],
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
