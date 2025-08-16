'use client'
import { useEffect, useState } from 'react'

export type MedRow = { name:string; dose?:string; start?:string; stop?:string; purpose?:string; response?:string; sidefx?:string }

export default function SmartImportMeds({open, onClose, onApply}:{open:boolean; onClose:()=>void; onApply:(rows:MedRow[], target:'current'|'past')=>void}){
  const [files, setFiles] = useState<File[]>([])
  const [target, setTarget] = useState<'current'|'past'>('current')

  useEffect(()=>{ if(!open){ setFiles([]); setTarget('current') } }, [open])
  if(!open) return null

  function apply(){
    const rows = files.map(f=>({ name: f.name.replace(/\.[^.]+$/, '') }))
    onApply(rows, target)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40" role="dialog" aria-modal="true" aria-label="Smart Import — Medications">
      <div className="card max-w-lg w-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Smart Import — Medications</h3>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        <div className="grid gap-3">
          <input type="file" multiple accept="application/pdf,image/*" onChange={e=>setFiles(Array.from(e.target.files||[]))} />
          <div className="flex items-center gap-2 text-sm">
            <label><input type="radio" checked={target==='current'} onChange={()=>setTarget('current')} /> Current</label>
            <label><input type="radio" checked={target==='past'} onChange={()=>setTarget('past')} /> Past</label>
          </div>
          <button className="btn btn-primary" onClick={apply} disabled={!files.length}>Add {files.length} file{files.length!==1?'s':''}</button>
        </div>
      </div>
    </div>
  )
}
