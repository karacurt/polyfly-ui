import type { Metadata } from "next";
import { Instrument_Serif, Outfit } from "next/font/google";
import "./globals.css";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

const sans = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000",
  ),
  title: "Polyfly — a living connectome on Polygon",
  description:
    "A MaleCNS paper trader with FlyWire-style neurons and Consciousness proxies. Display-only Polygon DEX wallet. No real orders.",
  applicationName: "Polyfly",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Polyfly — a living connectome on Polygon",
    description:
      "A MaleCNS paper trader with FlyWire-style neurons and Consciousness proxies. Display-only Polygon DEX wallet. No real orders.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
