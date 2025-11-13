import ClientProvider from "@/components/providers/ClientProvider";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <ClientProvider>{children}</ClientProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
