"use client";

import React, { useEffect, useState } from "react";
import { InstantSearch, SearchBox, Hits } from "react-instantsearch";
import { searchClient, indexName } from "../config/typesense";

export default function Page() {
  // Defer rendering until the component is mounted on the client.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Optionally, render a loading indicator here instead of returning null.
    return null;
  }

  return (
    <InstantSearch
      indexName={indexName}
      searchClient={searchClient}
      // Additional optional parameters per the latest InstantSearch.js v4 documentation:
      numberLocale="en" // Sets the locale for number formatting
      onStateChange={({ uiState, setUiState }) => {
        // Callback triggered on state changes.
        console.log("UI state changed:", uiState);
        setUiState(uiState);
      }}
      stalledSearchDelay={500} // Consider a search stalled after 500 ms
      routing={false} // You can set this to true or provide an object for custom URL state management
      insights={true} // Enable the insights middleware (requires search-insights library)
      future={{
        preserveSharedStateOnUnmount: true, // Prevent widgets from removing their state when unmounting if others are still using it.
        persistHierarchicalRootCount: true, // Displays the sum of children facet counts at the hierarchical root
      }}
    >
      <SearchBox />
      <Hits />
    </InstantSearch>
  );
}
