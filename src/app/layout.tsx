import "./globals.css";
import type { Metadata } from "next";
import { HeroUIProvider } from "@heroui/react";

export const metadata: Metadata = {
  title: "nidomi.io",
  description: "HeroUI Template with Custom Design Tokens",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <HeroUIProvider>
          {children}
        </HeroUIProvider>
      </body>
    </html>
  );
}
