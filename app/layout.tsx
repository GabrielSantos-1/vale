import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://verdevale.example.com"),
  title: "Verde Vale Connect",
  description:
    "Internet fibra com planos claros, cobertura regional e atendimento proximo.",
  openGraph: {
    title: "Verde Vale Connect",
    description:
      "Internet fibra com planos claros, cobertura regional e atendimento proximo.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verde Vale Connect",
    description:
      "Internet fibra com planos claros, cobertura regional e atendimento proximo.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className="bg-background text-primary"
    >
      <body>{children}</body>
    </html>
  );
}
