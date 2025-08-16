
'use client'
import { useState, useEffect } from 'react'
import { usePacket, saveToLocal } from '@/lib/store'

export default function PatientCard(){
  const set = usePacket(s => s.set)
  const patient = usePacket(s => s.patient)
  const [name, setName] = useState(patient.name||'Jay')
  const [pronouns, setPronouns] = useState(patient.pronouns||'')
  useEffect(()=>{
    set('patient', { ...usePacket.getState().patient, name, pronouns })
    saveToLocal({})
  }, [name, pronouns, set])
  return (
    <div className="card">
      <h2 className="text-lg font-semibold">Patient settings</h2>
      <p className="text-sm text-[color:var(--muted)] mb-3">This helps personalize copy across the app.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="patient-name">Name</label>
          <input id="patient-name" className="input" value={name} onChange={e=>setName(e.target.value)} aria-label="Patient name" />
        </div>
        <div>
          <label className="label" htmlFor="patient-pronouns">Pronouns (optional)</label>
          <input id="patient-pronouns" className="input" value={pronouns} onChange={e=>setPronouns(e.target.value)} placeholder="she/her, he/him, they/them" aria-label="Patient pronouns" />
        </div>
      </div>
    </div>
  )
}
