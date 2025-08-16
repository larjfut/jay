'use client'
import TwoCol from '@/components/TwoCol'
import InfoSidebar from '@/components/InfoSidebar'
import { usePacket } from '@/lib/store'

export default function Page() {
  const store = usePacket()
  return (
    <main className="grid gap-6">
      <TwoCol>
        <div>
          <h2 className="text-lg font-semibold">Section 7 — Medications</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">Use the Wizard to add current and past medications.</p>
        </div>
        <InfoSidebar title="What to include for Jay — Medications">
          <ul className="list-disc pl-5 text-sm">
            <li>Names, dose, frequency</li>
            <li>Start/stop dates if known</li>
            <li>Purpose, response, side effects as needed</li>
          </ul>
        </InfoSidebar>
      </TwoCol>
    </main>
  )
}
