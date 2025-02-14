"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { useToggleRefinement } from "react-instantsearch";
import cx from "clsx";

export type BusinessTypeToggleProps = React.ComponentProps<"div"> & {
  attribute: string;
  on: string;
  off: string;
  classNames?: {
    root?: string;
    buttonOn?: string;
    buttonOff?: string;
  };
  translations?: {
    on?: string;
    off?: string;
  };
};

export function BusinessTypeToggle({
  attribute,
  on,
  off,
  classNames = {},
  translations = {},
  ...props
}: BusinessTypeToggleProps) {
  const { t } = useTranslation();
  // Use the toggle connector with the passed attribute and labels.
  const { value, refine } = useToggleRefinement({ attribute, on, off });

  // Allow override of button labels via translations, defaulting to t(on)/t(off).
  const onLabel = translations.on || t(`businessType.${on}`);
  const offLabel = translations.off || t(`businessType.${off}`);

  return (
    <div
      {...props}
      className={cx("ais-BusinessTypeToggle", classNames.root, props.className)}
    >
      <Button
        type="button"
        className={cx(
          "px-4 py-2 border border-gray-300 rounded-none",
          value.isRefined
            ? "bg-red-600 text-white/70 border-red-800 hover:border-gray-900"
            : "bg-white text-gray-700 hover:bg-gray-50 font-bold",
          classNames.buttonOff
        )}
        onClick={() => refine({ isRefined: true })}
      >
        {offLabel}
      </Button>
      <Button
        type="button"
        className={cx(
          "px-4 py-2 border border-gray-300 rounded-none",
          !value.isRefined
            ? "bg-red-600 text-white/70 border-red-800 hover:border-gray-900"
            : "bg-white text-gray-700 hover:bg-gray-50 font-bold",
          classNames.buttonOn
        )}
        onClick={() => refine({ isRefined: false })}
      >
        {onLabel}
      </Button>
    </div>
  );
}
