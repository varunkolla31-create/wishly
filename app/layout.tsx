import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: "Wishly",
  title: {
    default: "Wishly — a wish they can unlock",
    template: "%s · Wishly",
  },
  description:
    "Create a password-protected wish page for any occasion, alone or with friends. Send the link, share the password, and let them unlock something made just for them.",
  openGraph: {
    type: "website",
    siteName: "Wishly",
    title: "Wishly — a wish they can unlock",
    description:
      "A password-protected wish page they open like a gift. Birthdays, weddings, thank-yous and everything in between.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wishly — a wish they can unlock",
    description:
      "Create a password-protected wish page and share it with a link.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${instrumentSerif.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
