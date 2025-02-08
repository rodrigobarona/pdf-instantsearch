"use client";

import { InstantSearchNext } from "react-instantsearch-nextjs";
import { SearchBox } from "react-instantsearch";
import { searchClient, indexName } from "@/config/typesense";
import { useTranslation } from "react-i18next";
import { useRouter, useParams } from "next/navigation";

export function SearchHero() {
  const { t } = useTranslation();
  const router = useRouter();
  const { lng } = useParams<{ lng: string }>();

  return (
    <InstantSearchNext
      indexName={indexName}
      searchClient={searchClient}
      routing={true}
      insights={true}
    >
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-4xl font-bold mb-8">{t("findYourDreamHome")}</h1>
        <div className="w-full max-w-2xl">
          <SearchBox
            placeholder={t("searchPlaceholder")}
            searchAsYouType={false}
            autoFocus={true}
            submitIconComponent={() => (
              <div className="w-20 h-10 bg-blue-500 text-white flex items-center justify-center">
                {t("search")}
              </div>
            )}
            onSubmit={(event) => {
              event.preventDefault();
              const query = (event.target as HTMLFormElement).querySelector(
                "input"
              )?.value;
              router.push(
                `/${lng}/properties${
                  query ? `?q=${encodeURIComponent(query)}` : ""
                }`
              );
            }}
            classNames={{
              root: "w-full",
              form: "relative flex items-center",
              reset: "hidden",
              input:
                "w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500",
            }}
          />
        </div>
      </div>
    </InstantSearchNext>
  );
}
