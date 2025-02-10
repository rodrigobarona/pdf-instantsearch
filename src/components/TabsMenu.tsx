"use client";

import React from "react";
import { connectToggleRefinement } from "instantsearch.js/es/connectors";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface ToggleProps {
  value: {
    isRefined: boolean;
    count: number | null;
  };
  refine: (nextRefinement: { isRefined: boolean }) => void;
  canRefine: boolean;
}

const BusinessTypeToggle = ({ value, refine, canRefine }: ToggleProps) => {
  const { t } = useTranslation();

  if (!canRefine) {
    return null;
  }

  return (
    <div className="flex border-b mb-4">
      <Button
        variant="link"
        type="button"
        onClick={() => refine({ isRefined: false })}
        className={`px-4 py-2 focus:outline-none transition-colors rounded-none ${
          !value.isRefined
            ? "border-b-2 border-blue-500 text-blue-500"
            : "text-gray-600 hover:text-blue-500"
        }`}
      >
        {t("businessType.sale")}
      </Button>
      <Button
        variant="link"
        type="button"
        onClick={() => refine({ isRefined: true })}
        className={`px-4 py-2 focus:outline-none transition-colors rounded-none ${
          value.isRefined
            ? "border-b-2 border-blue-500 text-blue-500"
            : "text-gray-600 hover:text-blue-500"
        }`}
      >
        {t("businessType.lease")}
      </Button>
    </div>
  );
};

// Create the custom widget
export const TabsMenu = connectToggleRefinement(BusinessTypeToggle);

// Usage example:
// <TabsMenu attribute="business_type_id" on="lease" off="sale" />
