import React from "react";

export type PropertyHit = {
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

interface PropertyHitProps {
  hit: PropertyHit;
  lng: string;
}

export function PropertyHitComponent({ hit, lng }: PropertyHitProps) {
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
