import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Verde Vale 2.0",
  description: "Provedor de internet fibra óptica com estética Cyber-Professional",
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