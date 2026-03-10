import type { Metadata } from "next";
import { Playfair_Display, Source_Serif_4, Space_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UserProvider } from "@/contexts/UserContext";
import SessionProvider from "@/components/providers/SessionProvider";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Machann Enfòmasyon — Market Information for Haiti's Madan Sara",
  description:
    "A bilingual market information platform providing price transparency, community savings (sòl), and financial access for Haiti's madan sara traders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ht">
      <body
        className={`${playfair.variable} ${sourceSerif.variable} ${spaceMono.variable} antialiased noise-bg min-h-screen`}
      >
        <SessionProvider>
          <LanguageProvider>
            <UserProvider>{children}</UserProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
