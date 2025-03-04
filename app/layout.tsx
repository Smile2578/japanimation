import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-jp",
});

export const metadata: Metadata = {
  title: "Traducteur Japonais Interactif",
  description: "Apprenez le japonais avec une animation interactive des caractères et leur prononciation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.variable} ${notoSansJP.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
