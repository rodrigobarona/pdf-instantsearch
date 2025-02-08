import React from "react";
import Image from "next/image";
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
  business_type_id: "sale" | "lease";
  cover_photo: string;
};

interface PropertyHitProps {
  hit: PropertyHit;
  lng: string;
}

export function PropertyHitComponent({ hit, lng }: PropertyHitProps) {
  return (
    <div className="p-4 border rounded-lg shadow hover:shadow-md transition-shadow">
      <Image
        src={hit.cover_photo || "/img/placeholder.svg"}
        alt={hit.title}
        width={500}
        height={500}
        className="w-full h-40 object-cover rounded-lg mb-4"
      />
      <div className="flex justify-between items-center mb-2">
        <p className="text-gray-500">{hit.business_type_id}</p>
      </div>
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
