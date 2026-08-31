import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "Overload — gym tracker",
  description:
    "Personal workout tracker for the 12-week bulk block: set logging, rest timers and progressive-overload tracking.",
  appleWebApp: {
    capable: true,
    title: "Overload",
    statusBarStyle: "black-translucent",
  },
  // Personal tool — keep it out of search engines.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-zinc-950 font-sans">
        {children}
        <Toaster richColors position="top-center" theme="dark" />
      </body>
    </html>
  );
}
