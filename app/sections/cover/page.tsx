'use client'
import { useEffect, useState } from 'react'
import { usePacket, loadFromLocal, saveToLocal, CoverTOCItem } from '@/lib/store'
import { generateCoverTocDoc } from '@/lib/docgen'

export default function CoverPage(){
  const store = usePacket()
  const [meta, setMeta] = useState(store.coverToc || {items:[]})
  const [items, setItems] = useState<CoverTOCItem[]>(store.coverToc?.items || [])

  useEffect(()=>{
    const loaded = loadFromLocal()
    if (loaded.coverToc) {
      // @ts-ignore
      setMeta(loaded.coverToc)
      // @ts-ignore
      setItems(loaded.coverToc.items || [])
    }
  },[])

  useEffect(()=>{
    store.set('coverToc', { ...meta, items }); saveToLocal({} as any)
  },[meta, items])

  return (
    <main className="card space-y-4">
      <h2 className="text-lg font-semibold">Section 1 — Cover Page & Master TOC</h2>
      <Field label="Patient Name" value={meta.patientName||''} onChange={v=>setMeta({...meta, patientName:v})}/>
      <Field label="DOB" value={meta.dob||''} onChange={v=>setMeta({...meta, dob:v})}/>
      <Field label="Date Prepared" value={meta.datePrepared||''} onChange={v=>setMeta({...meta, datePrepared:v})}/>
      <Field label="Contact" value={meta.contact||''} onChange={v=>setMeta({...meta, contact:v})}/>

      <h3 className="section-title">Sections Included</h3>
      <Table rows={items} onChange={setItems} />
      <div className="pt-2">
        <button className="btn btn-primary" onClick={()=>generateCoverTocDoc(store)}>Export Cover & TOC (DOCX)</button>
      </div>
    </main>
  )
}

function Field({label, value, onChange}:{label:string; value:string; onChange:(v:string)=>void}){
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" value={value} onChange={e=>onChange(e.target.value)} />
    </div>
  )
}

function Table({rows, onChange}:{rows:CoverTOCItem[]; onChange:(r:CoverTOCItem[])=>void}){
  function upd(i:number, r:CoverTOCItem){ onChange(rows.map((row,k)=>k===i?r:row)) }
  return (
    <table className="w-full border text-sm">
      <thead><tr className="bg-gray-50">
        <th className="p-2 border">Section #</th>
        <th className="p-2 border">Title</th>
        <th className="p-2 border">Filename(s)</th>
        <th className="p-2 border">Page Count / File Size</th>
        <th className="p-2 border"></th>
      </tr></thead>
      <tbody>
        {rows.map((r,i)=>(
          <tr key={i}>
            <td className="p-2 border"><input className="input" value={r.section} onChange={e=>upd(i,{...r, section:e.target.value})}/></td>
            <td className="p-2 border"><input className="input" value={r.title} onChange={e=>upd(i,{...r, title:e.target.value})}/></td>
            <td className="p-2 border"><input className="input" value={r.filename||''} onChange={e=>upd(i,{...r, filename:e.target.value})}/></td>
            <td className="p-2 border"><input className="input" value={r.pagesOrSize||''} onChange={e=>upd(i,{...r, pagesOrSize:e.target.value})}/></td>
            <td className="p-2 border"><button className="btn" onClick={()=>onChange(rows.filter((_,k)=>k!==i))}>Remove</button></td>
          </tr>
        ))}
        <tr>
          <td colSpan={5} className="p-2">
            <button className="btn" onClick={()=>onChange([...rows,{section:'', title:'', filename:'', pagesOrSize:''}])}>Add row</button>
          </td>
        </tr>
      </tbody>
    </table>
  )
}
