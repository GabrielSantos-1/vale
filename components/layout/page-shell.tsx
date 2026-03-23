import React from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import MobileTabbar from "./mobile-tabbar";

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-primary">
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <Footer />
        <MobileTabbar />
      </div>
    </div>
  );
}