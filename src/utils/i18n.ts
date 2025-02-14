import type { PropertyHit } from "@/hooks/useAutocomplete";

export function getLocalizedField(
  item: PropertyHit,
  field: keyof PropertyHit,
  lng: string
): string {
  if (lng === "pt") return (item[field] || "") as string;

  // Handle slug_url specially
  if (field === "slug_url") {
    const localizedSlug = item[`slug_url_${lng}`];
    return (localizedSlug || item.slug_url || "") as string;
  }

  const localizedField = item[`${field}_${lng}`];
  return (localizedField || item[field] || "") as string;
}
