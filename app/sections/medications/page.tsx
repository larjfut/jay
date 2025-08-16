'use client'
import TwoCol from '@/components/TwoCol'
import InfoSidebar from '@/components/InfoSidebar'
import SmartImportDialog from '@/components/SmartImportDialog'
import { usePacket, saveToLocal } from '@/lib/store'
import { useState } from 'react'

export default function Page() {
  const store = usePacket()
  const [openMeds, setOpenMeds] = useState(false)
  function onApplyMeds(r:{category:string; filename?:string; dateRange?:string}){
    const name = (r.filename||'').replace(/\.[^.]+$/, '')
    // Append a simple row into medsPast as a placeholder mapping
    // Adjust structure to match your store if needed
    store.set('medsPast', [...(store.medsPast||[]), { name }]); saveToLocal({} as any)
  }
  return (
    <main className="grid gap-6">
      <TwoCol>
        <div>
          <h2 className="text-lg font-semibold">Section 7 — Medications</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <button className="btn" onClick={()=>setOpenMeds(true)}>Smart Import (PDFs/images)</button>
          </div>
          <p className="mt-3 text-sm text-[color:var(--muted)]">Use Smart Import to add multiple meds quickly, then refine in the Wizard.</p>
        </div>
        <InfoSidebar title="What to include for Jay — Medications">
          <ul className="list-disc pl-5 text-sm">
            <li>Names, dose, frequency</li>
            <li>Start/stop dates if known</li>
            <li>Purpose, response, side effects as needed</li>
          </ul>
        </InfoSidebar>
      </TwoCol>
      <SmartImportMeds open={openMeds} onClose={()=>setOpenMeds(false)} onApply={(rows,target)=>{ if(target==='current'){ store.set('medsCurrent', [...store.medsCurrent, ...rows]); } else { store.set('medsPast', [...store.medsPast, ...rows]); } saveToLocal({} as any) }} />
    </main>
  )
}
