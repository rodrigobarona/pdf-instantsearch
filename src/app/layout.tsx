"use client";

import { indexName } from "@/config/typesense";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import "./globals.css";
import { searchClient } from "@/config/typesense";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InstantSearchNext
      indexName={indexName}
      searchClient={searchClient}
      insights={true}
      routing={{
        router: {
          cleanUrlOnDispose: false,
          windowTitle(routeState) {
            const indexState = routeState.indexName || {};
            return indexState.query
              ? `MyWebsite - Results for: ${indexState.query}`
              : "MyWebsite - Results page";
          },
        },
      }}
      future={{
        preserveSharedStateOnUnmount: true,
      }}
    >
      {children}
    </InstantSearchNext>
  );
}
