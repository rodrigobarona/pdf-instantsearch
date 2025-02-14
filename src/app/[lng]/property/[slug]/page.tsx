"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { InstantSearch, LookingSimilar, Carousel } from "react-instantsearch";
import { searchClient, indexName } from "@/config/typesense";
import type { PropertyHit } from "@/hooks/useAutocomplete";
import { useTranslation } from "react-i18next";
import { getLocalizedField } from "@/utils/i18n";
import type { UiState } from "instantsearch.js";
import {
  Carousel as UICarousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { MapPin, Euro, BedDouble, Bath, Maximize, Loader2 } from "lucide-react";

export default function PropertyPage() {
  const { lng, slug } = useParams<{ lng: string; slug: string }>();
  const [property, setProperty] = useState<PropertyHit | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchProperty = async () => {
      // Get the appropriate slug based on language
      const urlSlug = slug.toString();

      const response = await fetch(
        `/api/property?slug=${encodeURIComponent(urlSlug)}&lng=${lng}`
      );
      const data = await response.json();
      setProperty(data);
    };
    fetchProperty();
  }, [slug, lng]);

  if (!property)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      </div>
    );

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={indexName}
      insights={true}
      routing={{
        router: {
          createURL: ({ location }: { location: UiState }) => {
            const urlSlug = getLocalizedField(property, "slug_url", lng);
            return `/${lng}/property/${urlSlug}${location.search}`;
          },
          onUpdate(callback) {
            callback({ location: {} });
          },
          read: () => {
            return { location: {} };
          },
          write: () => {
            // Handle write if needed
            return { location: {} };
          },
          dispose: () => {
            // Clean up if needed
            return { location: {} };
          },
        },
      }}
      future={{
        preserveSharedStateOnUnmount: true,
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div>
            <UICarousel className="w-full">
              <CarouselContent>
                {property.photos?.map((photo, photoId) => (
                  <CarouselItem key={photo.url}>
                    <div className="relative aspect-square">
                      <Image
                        src={photo.url}
                        alt={`${getLocalizedField(
                          property,
                          "title",
                          lng
                        )} - Photo ${photoId + 1}`}
                        fill
                        className="object-cover rounded-lg"
                        priority={photoId === 0}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </UICarousel>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">
                {getLocalizedField(property, "title", lng)}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>
                  {property.zone}
                  {property.alternate_zone && ` (${property.alternate_zone})`}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              {property.price && (
                <div className="flex items-center gap-2">
                  <Euro className="w-5 h-5" />
                  <span className="text-2xl font-bold">
                    {property.price.toLocaleString(lng)}
                  </span>
                </div>
              )}
              <Badge variant="secondary">
                {t(`businessType.${property.business_type_id}`)}
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4">
              {property.bedrooms && (
                <div className="flex items-center gap-2">
                  <BedDouble className="w-5 h-5" />
                  <span>
                    {property.bedrooms} {t("bedrooms")}
                  </span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5" />
                  <span>
                    {property.bathrooms} {t("bathrooms")}
                  </span>
                </div>
              )}
              {property.area && (
                <div className="flex items-center gap-2">
                  <Maximize className="w-5 h-5" />
                  <span>{property.area}m²</span>
                </div>
              )}
            </div>

            <Tabs defaultValue="description">
              <TabsList>
                <TabsTrigger value="description">
                  {t("description")}
                </TabsTrigger>
                <TabsTrigger value="features">{t("features")}</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <p className="text-gray-700">
                  {getLocalizedField(property, "description", lng)}
                </p>
              </TabsContent>
              <TabsContent value="features" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {property.amenities?.map((amenity: string) => (
                    <div
                      key={`amenity-${amenity}`}
                      className="flex items-center gap-2"
                    >
                      <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <Button size="lg" className="w-full">
              {t("contactAgent")}
            </Button>
          </div>
        </div>

        {/* Similar Properties */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">{t("similarProperties")}</h2>
          <LookingSimilar
            objectIDs={[property.objectID]}
            itemComponent={({ item }: { item: PropertyHit }) => (
              <Card>
                <CardContent className="p-4">
                  <div className="relative aspect-square mb-4">
                    <Image
                      src={item.photos?.[0]?.url || ""}
                      alt={getLocalizedField(item, "title", lng)}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <h3 className="font-semibold">
                    {getLocalizedField(item, "title", lng)}
                  </h3>
                  <p className="text-gray-600">{item.zone}</p>
                  {item.price && (
                    <p className="text-lg font-bold mt-2">
                      €{item.price.toLocaleString(lng)}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
            layoutComponent={Carousel}
            limit={4}
          />
        </div>
      </div>
    </InstantSearch>
  );
}
