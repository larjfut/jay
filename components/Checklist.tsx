'use client'
import { useState, useEffect } from 'react'
import { usePacket, loadFromLocal, saveToLocal } from '@/lib/store'

const items = [
  'Create Consultagene account',
  'Provider recommendation letter (Section 3)',
  'Personal Narrative (Section 2)',
  'Symptom Timeline (Section 4)',
  'Medical Records (Section 5)',
  'Test Results (Section 6)',
  'Medication History (Section 7)',
  'Family History (Section 8)'
]

export default function Checklist(){
  const checklist = usePacket(s => s.checklist)
  const set = usePacket(s => s.set)
  const [checks, setChecks] = useState<Record<string, boolean>>(checklist || {})
  useEffect(()=>{
    const loaded = loadFromLocal()
    if (loaded.checklist) setChecks(loaded.checklist)
  },[])
  useEffect(()=>{
    set('checklist', checks)
    saveToLocal({} as any)
  },[checks, set])
  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-3">Document Checklist</h2>
      <ul className="space-y-2">
        {items.map(key => (
          <li key={key} className="flex items-center gap-2">
            <input type="checkbox" checked={!!checks[key]} onChange={e=>setChecks({...checks,[key]:e.target.checked})}/>
            <span>{key}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
