'use client'
import { useEffect, useState } from 'react'
import { usePacket, loadFromLocal, saveToLocal, RecordsIndexRow } from '@/lib/store'
import { generateRecordsCoverDoc } from '@/lib/docgen'
import TwoCol from '@/components/TwoCol'
import InfoSidebar from '@/components/InfoSidebar'
import Tooltip from '@/components/Tooltip'
export default function RecordsPage(){
  const store = usePacket()
  const [rows, setRows] = useState<RecordsIndexRow[]>(store.recordsIndex||[])
  useEffect(()=>{
    const loaded = loadFromLocal()
    if (loaded.recordsIndex) setRows(loaded.recordsIndex as any)
  },[])
  useEffect(()=>{
    store.set('recordsIndex', rows); saveToLocal({} as any)
  },[rows])

  const left = (
    <main className="card">
      <IndexTable rows={rows} onChange={setRows} />
      <div className="pt-4">
        <button className="btn btn-primary" onClick={()=>generateRecordsCoverDoc(store)}>Export Cover Sheet (DOCX)</button>
      </div>
    </main>
  )

  const right = (
    <InfoSidebar title="What to Include for Jay — Records">
      <ul>
        <li>Primary care summaries; relevant preventive visits with observations</li>
        <li>Specialist notes grouped by specialty</li>
        <li>Hospital/ER discharge summaries; procedure notes</li>
        <li>Imaging reports (written)</li>
        <li>Lab & genetic reports (written)</li>
        <li>Functional tests (EMG, PFT, EEG)</li>
        <li>Therapy notes and other supporting docs</li>
      </ul>
      <p className="mt-2"><strong>Format & Naming</strong></p>
      <ul>
        <li>PDFs only; combine by category; chronological order</li>
        <li>Filename pattern: <code>5.1_Primary_Care_Notes_2018-2025.pdf</code></li>
      </ul>
      <p className="mt-2"><strong>Checklist</strong></p>
      <ul>
        <li>No missing pages; legible scans</li>
        <li>Irrelevant records removed</li>
        <li>File numbers match the index above</li>
      </ul>
    </InfoSidebar>
  )

  return <TwoCol left={left} right={right} />
}

function IndexTable({rows, onChange}:{rows:RecordsIndexRow[]; onChange:(r:RecordsIndexRow[])=>void}){
  function upd(i:number, r:RecordsIndexRow){ onChange(rows.map((row,k)=>k===i?r:row)) }
  return (
    <table className="w-full border text-sm">
      <thead><tr className="bg-gray-50">
        <th className="p-2 border">File #</th>
        <th className="p-2 border"><div className="flex items-center gap-2">Filename <Tooltip label="Use clear names that match your index. Example: 5.2_Neurology_Notes_2019-2025.pdf" /></div></th>
        <th className="p-2 border">Contents Description</th>
        <th className="p-2 border"><div className="flex items-center gap-2">Date Range <Tooltip label="Format as MM/YYYY–MM/YYYY. If unsure, approximate month/year is okay." /></div></th>
      </tr></thead>
      <tbody>
        {rows.map((r,i)=>(
          <tr key={i}>
            <td className="p-2 border">{i+1}</td>
            <td className="p-2 border"><input className="input" placeholder="e.g., 5.2_Neurology_Notes_2019-2025.pdf" value={r.filename||''} onChange={e=>upd(i,{...r, filename:e.target.value})}/></td>
            <td className="p-2 border">{r.category}</td>
            <td className="p-2 border"><input className="input" placeholder="MM/YYYY–MM/YYYY" value={r.dateRange||''} onChange={e=>upd(i,{...r, dateRange:e.target.value})}/></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
