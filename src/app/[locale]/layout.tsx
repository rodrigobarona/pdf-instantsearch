import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { searchClient } from "@/config/typesense";
import { indexName } from "@/config/typesense";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import { LANGUAGES } from "@/config/constants";

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
      <body>
        <NextIntlClientProvider messages={messages}>
          <InstantSearchNext
            indexName={indexName}
            searchClient={searchClient}
            routing={{
              router: {
                cleanUrlOnDispose: false,
                windowTitle(routeState) {
                  const indexState = routeState.indexName || {};
                  return indexState.query
                    ? `Porta da Frente Christie's - Results for: ${indexState.query}`
                    : "Porta da Frente Christie's - Results page";
                },
              },
            }}
            future={{
              preserveSharedStateOnUnmount: true,
            }}
          >
            {children}
          </InstantSearchNext>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
