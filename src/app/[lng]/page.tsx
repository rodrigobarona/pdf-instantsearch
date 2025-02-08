"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { InstantSearch, SearchBox, Hits } from "react-instantsearch";
import { searchClient, indexName } from "../../config/typesense";
import { useTranslation } from "react-i18next";
import "../../config/i18n";

type PropertyHit = {
  title: string;
  title_en?: string;
  title_pt?: string;
  title_fr?: string;
  category_name: string;
  category_name_en?: string;
  category_name_pt?: string;
  category_name_fr?: string;
  county: string;
  price: number;
};

function HitComponent({ hit, lng }: { hit: PropertyHit; lng: string }) {
  return (
    <div className="p-4 border rounded-lg shadow hover:shadow-md transition-shadow">
      <h2 className="text-xl font-semibold">
        {hit[`title_${lng}` as keyof PropertyHit] || hit.title}
      </h2>
      <p className="text-gray-600">
        {hit[`category_name_${lng}` as keyof PropertyHit] || hit.category_name}
      </p>
      <p className="text-gray-500">{hit.county}</p>
      <p className="text-lg font-bold mt-2">€{hit.price.toLocaleString()}</p>
    </div>
  );
}

export default function Page() {
  const { lng } = useParams<{ lng: string }>(); // Read the dynamic [lng] parameter
  const [mounted, setMounted] = useState(false);
  const { i18n, t } = useTranslation();

  // Ensure the client only renders when mounted to avoid hydration issues.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Change i18next's language if it differs from the URL parameter.
  useEffect(() => {
    if (lng && i18n.language !== lng) {
      i18n.changeLanguage(lng);
    }
  }, [lng, i18n]);

  if (!mounted) {
    // Optionally render a loading indicator
    return null;
  }

  const currentLng = i18n.language || "pt";

  return (
    <InstantSearch
      indexName={indexName}
      searchClient={searchClient}
      numberLocale="en"
      onStateChange={({ uiState, setUiState }) => {
        console.log("UI state changed:", uiState);
        setUiState(uiState);
      }}
      stalledSearchDelay={500}
      routing={false}
      insights={true}
      future={{
        preserveSharedStateOnUnmount: true,
        persistHierarchicalRootCount: true,
      }}
    >
      <SearchBox
        placeholder={t("searchPlaceholder")}
        classNames={{
          root: "w-full",
          form: "relative",
          input:
            "w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500",
          submit: "hidden",
          reset: "hidden",
        }}
      />
      <Hits<PropertyHit>
        hitComponent={({ hit }) => <HitComponent hit={hit} lng={currentLng} />}
      />
    </InstantSearch>
  );
}
