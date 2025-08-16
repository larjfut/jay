import './globals.css'
import type { Metadata } from 'next'
// app/layout.tsx
import { LayoutDashboard, Sparkles, Workflow, Stethoscope, FolderOpenDot, TestTubes, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Baylor UDC Packet Dashboard',
  description: 'Wizard & dashboard for Baylor UDC self-referral packet'
}

import { ToastProvider } from '@/components/Toast'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container py-6">
          <header className="mb-6 card flex items-center justify-between">
            <h1 className="text-2xl font-bold">Baylor UDC Packet Dashboard</h1>
            <nav className="flex flex-wrap gap-2">
              <a className="btn" href="/"><LayoutDashboard size={20} className="mr-2"/>Dashboard</a>
              <a className="btn" href="/quick-overview"><Sparkles size={20} className="mr-2"/>Quick Overview</a>
              <a className="btn" href="/wizard">Wizard</a>
              <a className="btn" href="/sections/provider">Sec 3: Provider</a>
              <a className="btn" href="/sections/records">Sec 5: Records</a>
              <a className="btn" href="/sections/tests">Sec 6: Tests</a>
              <a className="btn" href="/sections/cover">Sec 1/9: Cover & TOC</a>
            </nav>
          </header>
          <ToastProvider>
            {children}
          </ToastProvider>
          <footer className="mt-12 text-xs text-gray-500">Local-only by default. No data is sent to a server unless you export files.</footer>
        </div>
      </body>
    </html>
  )
}
