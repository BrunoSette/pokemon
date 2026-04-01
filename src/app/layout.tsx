import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "Pokémon Yellow Collector",
  description: "Catch 'em all! A Pokémon collection game inspired by HeartGold/SoulSilver",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pixelFont.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#0a0a1a]">{children}</body>
    </html>
  );
}
