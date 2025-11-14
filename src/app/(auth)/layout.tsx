import ClientProvider from "@/components/providers/ClientProvider";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="google" content="notranslate" />
      </head>
      <body>
        <ClientProvider>{children}</ClientProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
