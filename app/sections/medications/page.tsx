'use client'
import { useState } from 'react'
import TwoCol from '@/components/TwoCol'
import InfoSidebar from '@/components/InfoSidebar'
import SmartImportMeds from '@/components/SmartImportMeds'
import { usePacket, saveToLocal, type MedRow } from '@/lib/store'

export default function Page() {
  const store = usePacket()
  const [open, setOpen] = useState(false)

  function apply(row: MedRow){
    if (row.stop) store.set('medsPast', [...store.medsPast, row])
    else store.set('medsCurrent', [...store.medsCurrent, row])
    saveToLocal({} as any)
  }

  return (
    <main className="grid gap-6">
      <TwoCol>
        <div>
          <h2 className="text-lg font-semibold">Section 7 — Medications</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">Use the Wizard to add current and past medications.</p>
          <button className="btn mt-4" onClick={()=>setOpen(true)}>Smart Import</button>
        </div>
        <InfoSidebar title="What to include for Jay — Medications">
          <ul className="list-disc pl-5 text-sm">
            <li>Names, dose, frequency</li>
            <li>Start/stop dates if known</li>
            <li>Purpose, response, side effects as needed</li>
          </ul>
        </InfoSidebar>
      </TwoCol>
      <SmartImportMeds open={open} onClose={()=>setOpen(false)} onApply={apply} />
    </main>
  )
}
