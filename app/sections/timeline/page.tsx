'use client'
import TwoCol from '@/components/TwoCol'
import InfoSidebar from '@/components/InfoSidebar'
import SmartImportTimeline from '@/components/SmartImportTimeline'
import { usePacket, saveToLocal } from '@/lib/store'
import { useState } from 'react'

export default function Page() {
  const store = usePacket()
  const [openTI, setOpenTI] = useState(false)
  return (
    <main className="grid gap-6">
      <TwoCol>
        <div>
          <h2 className="text-lg font-semibold">Section 4 — Symptom Timeline</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <button className="btn" onClick={()=>setOpenTI(true)}>Smart Import (PDFs/images)</button>
          </div>
          <p className="mt-3 text-sm text-[color:var(--muted)]">Import key dates and events from discharge summaries or reports, then refine in the Wizard.</p>
        </div>
        <InfoSidebar title="What to include for Jay — Timeline">
          <ul className="list-disc pl-5 text-sm">
            <li>Month and year is enough</li>
            <li>Onset, flares, hospitalizations, new dx</li>
            <li>Start/stop of meds or therapies</li>
          </ul>
        </InfoSidebar>
      </TwoCol>
      <SmartImportTimeline open={openTI} onClose={()=>setOpenTI(false)} onApply={(rows)=>{ store.set('narrative', { ...store.narrative, timeline: [...(store.narrative.timeline||[]), ...rows] }); saveToLocal({} as any) }} />
    </main>
  )
}
