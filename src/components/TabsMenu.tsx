"use client";

import React from "react";
import { useToggleRefinement } from "react-instantsearch";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function TabsMenu() {
  const { t } = useTranslation();
  const { value, refine, canRefine } = useToggleRefinement({
    attribute: "business_type_id",
    on: "lease",
    off: "sale",
  });

  if (!canRefine) return null;

  return (
    <div className="flex border-b mb-4">
      <Button
        variant="link"
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
}

// Usage example:
// <TabsMenu attribute="business_type_id" on="lease" off="sale" />
