'use client'
import { useEffect, useState } from 'react'
import { usePacket, loadFromLocal, saveToLocal, TestsIndexRow } from '@/lib/store'
import { generateTestsCoverDoc } from '@/lib/docgen'
import TwoCol from '@/components/TwoCol'
import InfoSidebar from '@/components/InfoSidebar'
import Tooltip from '@/components/Tooltip'
import SmartImportDialog from '@/components/SmartImportDialog'
export default function TestsPage(){
  const store = usePacket()
  const [rows, setRows] = useState<TestsIndexRow[]>(store.testsIndex||[])
  const [open, setOpen] = useState(false)
  useEffect(()=>{
    const loaded = loadFromLocal()
    if (loaded.testsIndex) setRows(loaded.testsIndex as any)
  },[])
  useEffect(()=>{
    store.set('testsIndex', rows); saveToLocal({} as any)
  },[rows])

  const left = (
    <main className="card">
      <div className="flex justify-end mb-2">
        <button className="btn" onClick={()=>setOpen(true)}>Smart Import</button>
      </div>
      <IndexTable rows={rows} onChange={setRows} />
      <div className="pt-4">
        <button className="btn btn-primary" onClick={()=>generateTestsCoverDoc(store)}>Export Cover Sheet (DOCX)</button>
      </div>
      <SmartImportDialog
        open={open}
        onClose={()=>setOpen(false)}
        onApply={r=>setRows(prev=>prev.map(row=>row.category===r.category?{...row, filename:r.filename, dateRange:r.dateRange}:row))}
      />
    </main>
  )

  const right = (
    <InfoSidebar title="What to Include for Jay — Tests">
      <ul>
        <li>Laboratories: CBC, CMP, autoimmune, metabolic, CSF, urine</li>
        <li>Genetics: WES, WGS, panels, CNV, mtDNA</li>
        <li>Imaging: MRI, CT, ultrasound, PET, X-ray (reports)</li>
        <li>Pathology: biopsies, cytology</li>
        <li>Functional/Specialty: EMG, EEG, echo, PFT, tilt table, sleep studies</li>
        <li>Other: ophthalmology, audiology, vestibular, exercise testing</li>
      </ul>
      <p className="mt-2"><strong>Format & Naming</strong></p>
      <ul>
        <li>PDFs; combine by category; chronological order</li>
        <li>Filename pattern: <code>6.2_WES_Report_2022.pdf</code></li>
        <li>Keep originals; highlight abnormal values on copies only</li>
      </ul>
      <p className="mt-2"><strong>Checklist</strong></p>
      <ul>
        <li>Include normal results that rule out conditions</li>
        <li>Ensure repeated abnormalities are represented</li>
        <li>DICOM/image files noted as available (if applicable)</li>
      </ul>
    </InfoSidebar>
  )

  return <TwoCol left={left} right={right} />
}

function IndexTable({rows, onChange}:{rows:TestsIndexRow[]; onChange:(r:TestsIndexRow[])=>void}){
  function upd(i:number, r:TestsIndexRow){ onChange(rows.map((row,k)=>k===i?r:row)) }
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
            <td className="p-2 border"><input className="input" placeholder="e.g., 6.3_MRI_Brain_Reports_2019-2024.pdf" value={r.filename||''} onChange={e=>upd(i,{...r, filename:e.target.value})}/></td>
            <td className="p-2 border">{r.category}</td>
            <td className="p-2 border"><input className="input" placeholder="MM/YYYY–MM/YYYY" value={r.dateRange||''} onChange={e=>upd(i,{...r, dateRange:e.target.value})}/></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
