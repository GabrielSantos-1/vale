import './globals.css'
import { ReactNode } from 'react'
import PageShell from '../components/layout/page-shell'

export const metadata = {
  title: 'Verde Vale 2.0',
  description: 'Provedor de internet fibra óptica com estética Cyber-Professional'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="bg-bg-primary text-text-primary">
      <body>
        <PageShell>{children}</PageShell>
      </body>
    </html>
  )
}
