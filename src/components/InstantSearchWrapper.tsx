"use client";

import { InstantSearchNext } from "react-instantsearch-nextjs";
import { searchClient, indexName } from "@/config/typesense";

export default function InstantSearchWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InstantSearchNext
      indexName={indexName}
      searchClient={searchClient}
      routing={{
        router: {
          cleanUrlOnDispose: false,
          windowTitle(routeState) {
            const indexState = routeState.indexName || {};
            return indexState.query
              ? `Porta da Frente Christie's - Results for: ${indexState.query}`
              : "Porta da Frente Christie's - Results page";
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
