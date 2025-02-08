"use client";

import "./globals.css";
import { Header } from "@/components/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <Header />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
