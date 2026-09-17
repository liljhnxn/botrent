import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { NetworkBanner } from "@/components/NetworkBanner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "BotRent — Decentralized NFT Rental Protocol | Botchain",
  description:
    "Decentralized escrow-based NFT rental protocol on Botchain Testnet. Rent NFTs. Own the experience without purchasing underlying assets.",
  keywords: ["NFT Rental", "Botchain", "Bohr", "Web3", "Smart Contracts", "Escrow", "Decentralized Finance"],
  authors: [{ name: "BotRent Protocol" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#080a18] text-slate-100 antialiased selection:bg-brand-cyan/20 selection:text-brand-cyan">
        <Providers>
          <NetworkBanner />
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
