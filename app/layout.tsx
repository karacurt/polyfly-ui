import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibm = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000"),
  title: "POLYFLY // NEURAL TRADING",
  description:
    "Paper trader MaleCNS no Polymarket. Experimento visual — sem ordens reais.",
  applicationName: "Polyfly",
  robots: { index: true, follow: true },
  openGraph: {
    title: "POLYFLY // NEURAL TRADING",
    description:
      "Paper trader MaleCNS no Polymarket. Experimento visual — sem ordens reais.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={ibm.variable}>
      <body>{children}</body>
    </html>
  );
}
