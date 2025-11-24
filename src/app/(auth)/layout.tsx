import ClientProvider from "@/components/providers/ClientProvider";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "../globals.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="google" content="notranslate" />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProvider>{children}</ClientProvider>
        </NextIntlClientProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
