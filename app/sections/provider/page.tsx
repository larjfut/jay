'use client'
import { useEffect, useState } from 'react'
import { usePacket, loadFromLocal, saveToLocal } from '@/lib/store'
import { generateProviderTrackerDoc } from '@/lib/docgen'
import TwoCol from '@/components/TwoCol'
import InfoSidebar from '@/components/InfoSidebar'

export default function ProviderPage(){
  const provider = usePacket(s => s.provider)
  const set = usePacket(s => s.set)
  const [p, setP] = useState(provider)
  useEffect(()=>{
    const loaded = loadFromLocal()
    if (loaded.provider) setP(loaded.provider as any)
  },[])
  useEffect(()=>{
    set('provider', p); saveToLocal({} as any)
  },[p, set])

  const left = (
    <main className="card space-y-4">
      <h2 className="text-lg font-semibold">Section 3 — Provider Letter Tracker</h2>
      <Field label="Doctor name" value={p.doctorName} onChange={v=>setP({...p, doctorName:v})} />
        <Field label="Specialty" value={p.specialty||''} onChange={v=>setP({...p, specialty:v})} />
      <Field label="Email" value={p.email||''} onChange={v=>setP({...p, email:v})} />
      <Field label="Due date (YYYY-MM-DD)" value={p.dueDate||''} onChange={v=>setP({...p, dueDate:v})} />
      <label className="label">Status</label>
      <select className="input" value={p.status||'Not started'} onChange={e=>setP({...p, status:e.target.value as any})}>
        <option>Not started</option>
        <option>Requested</option>
        <option>In progress</option>
        <option>Received</option>
      </select>
      <Field label="Notes" value={p.notes||''} onChange={v=>setP({...p, notes:v})} />
      <div className="pt-2">
        <button className="btn btn-primary" onClick={()=>generateProviderTrackerDoc(usePacket.getState())}>Export Tracker (DOCX)</button>
      </div>
    </main>
  )

  const right = (
    <InfoSidebar title="Provider Letter for Jay — Requirements & Tips">
      <ul>
        <li><strong>Must</strong> be on official letterhead, in English, and signed.</li>
        <li>Include: Chief concern, Symptom history (onset & course), Prior workup, Treatments & responses, Family history, Provider impression, Formal recommendation.</li>
        <li>Length: 1–2 pages; 400–700 words; use headers for skimmability.</li>
        <li>Do <em>not</em> embed labs or imaging; attach in Sections 5–6.</li>
      </ul>
      <p className="mt-2"><strong>Checklist</strong></p>
      <ul>
        <li>Provider & patient identifiers present</li>
        <li>Signed & dated</li>
        <li>Contact details for verification</li>
        <li>Status set to “Received” when uploaded</li>
      </ul>
    </InfoSidebar>
  )

  return <TwoCol left={left} right={right} />
}

function Field({label, value, onChange}:{label:string; value:string; onChange:(v:string)=>void}){
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" value={value} onChange={e=>onChange(e.target.value)} />
    </div>
  )
}
