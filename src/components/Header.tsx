"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "pt", name: "Português" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { i18n } = useTranslation();

  const currentLang = pathname.split("/")[1] || "pt";

  const handleLanguageChange = async (newLang: string) => {
    // Change i18next language
    await i18n.changeLanguage(newLang);

    // Update URL
    const newPathname = pathname.replace(`/${currentLang}`, `/${newLang}`);
    router.push(newPathname);
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={`/${currentLang}`} className="text-xl font-bold">
          Porta da Frente Christie&apos;s
        </Link>

        <div className="w-32">
          <Select value={currentLang} onValueChange={handleLanguageChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
