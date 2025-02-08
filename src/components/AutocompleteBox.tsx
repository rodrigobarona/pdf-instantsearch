import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useAutocomplete } from "@/hooks/useAutocomplete";
import { useTranslation } from "react-i18next";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function AutocompleteBox() {
  const { t } = useTranslation();
  const router = useRouter();
  const { lng } = useParams<{ lng: string }>();
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { indices, currentRefinement, refine } = useAutocomplete({
    defaultRefinement: "",
  });

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

  const handleSuggestionClick = (suggestion: any) => {
    setInputValue(suggestion.query);
    handleSubmit(new Event("submit") as any, suggestion.query);
  };

  return (
    <div className="relative w-full">
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
          className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
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
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border"
        >
          {indices[0].hits.map((hit: any, index: number) => (
            <button
              key={index}
              className={cn(
                "w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors",
                index === 0 && "rounded-t-lg",
                index === indices[0].hits.length - 1 && "rounded-b-lg"
              )}
              onClick={() => handleSuggestionClick(hit)}
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-600">
                  {hit[`title_${lng}` as keyof typeof hit] || hit.title}
                </span>
                <span className="text-sm text-gray-400">
                  {hit.county && `- ${hit.county}`}
                </span>
              </div>
              {hit.price && (
                <div className="text-sm text-gray-500">
                  €{hit.price.toLocaleString()}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
