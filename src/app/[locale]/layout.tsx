import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import InstantSearchWrapper from "@/components/InstantSearchWrapper";
import { LANGUAGES } from "@/config/constants";
import { Header } from "@/components/Header";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await the promise to get the locale
  const { locale } = await params;

  // Validate the locale; redirect to 404 if not supported.
  if (!LANGUAGES.includes(locale as (typeof LANGUAGES)[number])) {
    notFound();
  }

  // Enables static rendering of internationalized text.
  setRequestLocale(locale);

  // Get messages (translations) for the current locale.
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head />
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale} />
          <InstantSearchWrapper>{children}</InstantSearchWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
