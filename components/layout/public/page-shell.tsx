import Image from "next/image";
import React from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import { MobileTabbar } from "./mobile-tabbar";
import { WhatsappFloat } from "@/components/common/whatsapp-float";

type PageShellProps = {
  children: React.ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-primary public-shell">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          src="/images/public/fiber-hero-speed-burst.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-[0.42] saturate-165 contrast-105 brightness-125 scale-110"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(90,60,255,0.1),transparent_22%),radial-gradient(circle_at_76%_16%,rgba(39,211,255,0.34),transparent_20%),radial-gradient(circle_at_50%_54%,rgba(255,255,255,0.12),transparent_34%),linear-gradient(180deg,rgba(22,65,123,0.08)_0%,rgba(30,89,163,0.11)_28%,rgba(54,129,219,0.14)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_20%,rgba(255,255,255,0)_46%,rgba(255,255,255,0.03)_100%)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.012)_0px,rgba(255,255,255,0.012)_1px,transparent_1px,transparent_58px)] opacity-35" />
      </div>

      <div className="relative flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary focus:shadow-soft"
        >
          Pular para o conteúdo
        </a>

        <Navbar />

        <main id="main-content" className="flex-1 pb-24 md:pb-0">
          {children}
        </main>

        <Footer />
        <WhatsappFloat />
        <MobileTabbar />
      </div>
    </div>
  );
}
