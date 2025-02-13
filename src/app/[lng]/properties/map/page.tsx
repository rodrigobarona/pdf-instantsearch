"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import "@/config/i18n";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import { SearchBox, Configure } from "react-instantsearch";
import { searchClient, indexName } from "@/config/typesense";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { ViewType } from "@/types";

const PropertiesMap = dynamic(() => import("@/components/PropertiesMap"), {
  ssr: false,
});

export default function PropertiesMapPage() {
  const { lng } = useParams<{ lng: string }>();
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (lng && i18n.language !== lng) {
      i18n.changeLanguage(lng);
    }
  }, [lng, i18n]);

  if (!mounted) {
    return null;
  }

  // Determine current view (this file represents map view)
  const currentView: ViewType = "map";

  // Toggle bar to switch between List and Map view
  const viewToggle = (
    <div className="flex gap-4 mb-4">
      <Link
        href={`/${lng}/properties`}
        className="px-4 py-2 rounded bg-gray-200 text-gray-700"
      >
        List
      </Link>
      <Link
        href={`/${lng}/properties/map`}
        className={`px-4 py-2 rounded ${
          currentView === "map"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        Map
      </Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {viewToggle}
      <InstantSearchNext indexName={indexName} searchClient={searchClient}>
        <Configure hitsPerPage={36} getRankingInfo={true} numericFilters={[]} />
        <div className="mb-6">
          <SearchBox
            placeholder={t("searchPlaceholder")}
            classNames={{
              root: "relative",
              form: "relative",
              input:
                "w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              submit: "absolute right-3 top-1/2 -translate-y-1/2",
              reset: "hidden",
            }}
          />
        </div>
        <PropertiesMap />
      </InstantSearchNext>
    </div>
  );
}
