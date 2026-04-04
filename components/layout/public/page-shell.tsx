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
          src="/images/fiber-hero-tunnel.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-[0.58] saturate-120 contrast-104 brightness-98 scale-110"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(20,184,166,0.09),transparent_26%),radial-gradient(circle_at_84%_16%,rgba(34,197,94,0.08),transparent_28%),radial-gradient(circle_at_86%_42%,rgba(125,211,252,0.12),transparent_30%),linear-gradient(92deg,rgba(5,14,26,0.2)_0%,rgba(6,16,30,0.52)_36%,rgba(7,18,33,0.5)_58%,rgba(8,21,38,0.16)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,17,32,0.36)_0%,rgba(9,21,39,0.26)_24%,rgba(8,20,37,0.2)_56%,rgba(8,20,38,0.38)_100%)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(186,230,253,0.014)_0px,rgba(186,230,253,0.014)_1px,transparent_1px,transparent_68px)] opacity-30" />
      </div>

      <div className="relative flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary focus:shadow-soft"
        >
          Pular para o conteÃºdo
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


