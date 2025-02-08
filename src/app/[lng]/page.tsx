"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import "@/config/i18n";
import { SearchHero } from "@/components/SearchHero";

export const dynamic = "force-dynamic";

export default function Page() {
  const { lng } = useParams<{ lng: string }>();
  const [mounted, setMounted] = useState(false);
  const { i18n } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (lng && i18n.language !== lng) {
      i18n.changeLanguage(lng);
    }
  }, [lng, i18n]);

  if (!mounted) {
    return null;
  }

  return <SearchHero />;
}
