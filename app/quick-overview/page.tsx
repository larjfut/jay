'use client'
import Link from 'next/link'
import InfoSidebar from '@/components/InfoSidebar'
import { usePacket } from '@/lib/store'

export default function QuickOverviewPage() {
  const store = usePacket()
  const displayName = store?.patient?.name || 'your child'

  return (
    <main className="grid gap-6">
      <div className="card">
        <h2 className="text-2xl font-semibold mb-2">Let’s get {displayName}’s packet ready</h2>
        <p className="text-sm text-[color:var(--muted)]">
          We’ll build a polished Baylor Undiagnosed Program packet from your notes and uploads.
          Work section by section. You can pause and return any time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold mb-2">What this app does</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li>Guides you through each required section</li>
            <li>Imports PDFs to extract timeline, meds, and records</li>
            <li>Exports Word documents and a combined ZIP</li>
          </ul>
          <div className="mt-4">
            <Link href="/wizard" className="btn">Open the Wizard</Link>
          </div>
        </section>

        <InfoSidebar title="Gentle guide">
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>It’s okay to skip and return later</li>
            <li>Use plain words; medical terms are optional</li>
            <li>If a topic brings up feelings, take a break</li>
            <li>Ask a trusted person to help if that feels better</li>
          </ul>
          <p className="text-xs text-[color:var(--muted)] mt-3">
            Your answers stay in this browser unless you export.
          </p>
        </InfoSidebar>
      </div>
    </main>
  )
}
