import React from 'react'
import Navbar from './navbar'
import Footer from './footer'
import MobileTabbar from './mobile-tabbar'

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8">{children}</main>
      <Footer />
      <MobileTabbar />
    </div>
  )
}

