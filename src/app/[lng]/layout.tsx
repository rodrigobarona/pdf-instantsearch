import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";

// Initialize fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const supportedLanguages = ["pt", "en", "fr"];

export async function generateStaticParams() {
  return supportedLanguages.map((lng) => ({ lng }));
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ lng: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  // Await the params to get the language
  const { lng } = await params;

  // Validate language
  if (!supportedLanguages.includes(lng)) {
    notFound();
  }

  return (
    <html
      lang={lng}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head />
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background text-foreground antialiased"
      >
        <div className="w-full max-w-md px-4 mx-auto">{children}</div>
      </body>
    </html>
  );
}
