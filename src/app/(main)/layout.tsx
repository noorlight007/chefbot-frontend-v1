import type { Metadata } from "next";
import "../globals.css";
import { Montserrat } from "next/font/google";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { AppSidebar } from "@/components/app-sidebar";
import ClientProvider from "@/components/providers/ClientProvider";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/protected-route";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import LocaleProvider from "@/components/providers/LocalProviders";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CHEFBOT",
  description: "ChefBot is a recipe bot",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${montserrat.className} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LocaleProvider>
            <ClientProvider>
              <ProtectedRoute>
                <div className="[--header-height:calc(theme(spacing.14))]">
                  <SidebarProvider className="flex flex-col">
                    <SiteHeader />
                    <div className="flex flex-1">
                      <AppSidebar />
                      <SidebarInset>
                        <div className="w-full md:mx-auto xl:w-[80%]">
                          {children}
                        </div>
                      </SidebarInset>
                    </div>
                  </SidebarProvider>
                </div>
              </ProtectedRoute>
            </ClientProvider>
          </LocaleProvider>
          <Toaster position="top-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
