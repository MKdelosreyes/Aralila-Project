import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import "../styles/colors.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aralila",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <body>

        {children}
      </body>
    </html>
  );
}
