import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TranslatorProvider } from '../context/translatorContext';

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Traducteur Japonais Interactif",
  description: "Traduisez et animez des phrases japonaises avec une interface interactive",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${inter.variable} min-h-screen bg-background antialiased`}>
        <TranslatorProvider>
          <div className="container mx-auto px-4 py-4 md:py-6 max-w-4xl">
            {children}
          </div>
        </TranslatorProvider>
      </body>
    </html>
  );
}
