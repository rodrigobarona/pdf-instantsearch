"use client";

import React, { useEffect } from "react";
import { useMenu, type UseMenuProps } from "react-instantsearch";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function TabsMenu(props: UseMenuProps) {
  const { t } = useTranslation();
  const { items, refine } = useMenu(props);

  // Auto-select the first item if none is refined.
  useEffect(() => {
    if (items.length > 0 && !items.some((item) => item.isRefined)) {
      refine(items[0].value);
    }
  }, [items, refine]);

  return (
    <div className="flex border-b mb-4">
      {items.map((item) => (
        <Button
          variant="link"
          type="button"
          key={item.value}
          onClick={() => {
            // Only refine if this item is not already selected.
            if (!item.isRefined) {
              refine(item.value);
            }
          }}
          className={`px-4 py-2 focus:outline-none transition-colors rounded-none ${
            item.isRefined
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-600 hover:text-blue-500"
          }`}
        >
          {t(`businessType.${item.label}`)} ({item.count})
        </Button>
      ))}
    </div>
  );
}
