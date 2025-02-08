"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useAutocomplete } from "@/hooks/useAutocomplete";
import { useTranslation } from "react-i18next";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import type { PropertyHit } from "@/hooks/useAutocomplete";
import type { Hit } from "instantsearch.js";
export function AutocompleteBox() {
  const { t } = useTranslation();
  const router = useRouter();
  const { lng } = useParams<{ lng: string }>();
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { indices, refine } = useAutocomplete();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (event: React.FormEvent, query = inputValue) => {
    event.preventDefault();
    setIsOpen(false);
    router.push(
      `/${lng}/properties${query ? `?q=${encodeURIComponent(query)}` : ""}`
    );
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    refine(value);
    setIsOpen(Boolean(value));
  };

  const handleSuggestionClick = (suggestion: PropertyHit) => {
    setInputValue(suggestion.query || "");
    handleSubmit(
      { preventDefault: () => {} } as React.FormEvent,
      suggestion.query
    );
  };

  return (
    <div className="relative w-full" aria-label="Property search">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center w-full"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(Boolean(inputValue))}
          placeholder={t("searchPlaceholder")}
          aria-expanded={isOpen}
          aria-controls="search-suggestions"
          aria-label={t("searchPlaceholder")}
          className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="absolute right-0 w-20 h-10 bg-blue-500 text-white flex items-center justify-center rounded-r-lg"
        >
          {t("search")}
        </button>
      </form>

      {isOpen && indices[0]?.hits.length > 0 && (
        <div
          ref={dropdownRef}
          id="search-suggestions"
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border"
        >
          {indices[0].hits.map((hit: Hit<PropertyHit>, index: number) => (
            <Button
              variant="ghost"
              key={hit.objectID}
              className={cn(
                "w-full  text-left hover:bg-gray-100 transition-colors h-auto",
                index === 0 && "rounded-t-lg",
                index === indices[0].hits.length - 1 && "rounded-b-lg"
              )}
              onClick={() => handleSuggestionClick(hit)}
            >
              <Link
                href={`/${lng}/property/${
                  hit[`slug_url_${lng}` as keyof typeof hit] || hit.slug_url
                }`}
                className="w-full"
              >
                <div className="flex items-start justify-start gap-4 w-full">
                  <div className="w-12 h-12 shrink-0 relative overflow-hidden">
                    <Image
                      src={hit.cover_photo}
                      alt={String(
                        hit[`title_${lng}` as keyof typeof hit] || hit.title
                      )}
                      objectFit="cover"
                      sizes="(max-width: 768px) 100vw, 160px"
                      height={48}
                      width={48}
                    />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-gray-800 font-medium truncate">
                      {String(
                        hit[`title_${lng}` as keyof typeof hit] || hit.title
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {hit.county && hit.county}
                      </span>
                      {hit.price && (
                        <div className="text-sm font-semibold text-blue-600">
                          €{hit.price.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
