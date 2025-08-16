'use client'
import { useEffect, useState } from 'react'
import { extractTextFromPDF, extractTextFromImage, parseMedication } from '@/lib/extract'
import type { MedRow } from '@/lib/store'

export default function SmartImportMeds({open,onClose,onApply}:{open:boolean; onClose:()=>void; onApply:(row:MedRow)=>void}){
  const [files, setFiles] = useState<File[]>([])
  const [idx, setIdx] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>('')
  const [raw, setRaw] = useState<string>('')
  const [suggest, setSuggest] = useState<MedRow|null>(null)

  useEffect(()=>{ if(!open){ setFiles([]); setIdx(0); setBusy(false); setError(''); setRaw(''); setSuggest(null) } },[open])
  if(!open) return null

  const current = files[idx]
  const hasMore = idx < files.length - 1

  async function handleExtract(){
    if(!current) return
    setBusy(true); setError(''); setRaw(''); setSuggest(null)
    try{
      let text = ''
      if(current.type === 'application/pdf' || current.name.toLowerCase().endsWith('.pdf')) text = await extractTextFromPDF(current)
      else if(current.type.startsWith('image/')) text = await extractTextFromImage(current)
      else throw new Error('Please upload a PDF or an image file.')
      setRaw(text)
      setSuggest(parseMedication(text))
    }catch(e:any){ setError(e?.message||'Could not read the file.') }
    finally{ setBusy(false) }
  }

  function applyAndNext(){ if(suggest) onApply(suggest); if(hasMore){ setIdx(i=>i+1); setSuggest(null); setRaw(''); setError('') } else onClose() }
  function applyAndDone(){ if(suggest) onApply(suggest); onClose() }
  function skip(){ if(hasMore){ setIdx(i=>i+1); setSuggest(null); setRaw(''); setError('') } else onClose() }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40" role="dialog" aria-modal="true" aria-label="Smart Import — Meds">
      <div className="card max-w-2xl w-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Smart Import — Medications</h3>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        <p className="text-xs text-[color:var(--muted)] mb-3">Files are processed locally. Review and edit before applying.</p>

        <div className="grid gap-3">
          <div className="grid sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2"><input type="file" multiple accept="application/pdf,image/*" onChange={e=>{const list=Array.from(e.target.files||[]); setFiles(list); setIdx(0); setSuggest(null); setRaw(''); setError('')}} /></div>
            <div className="text-sm text-[color:var(--muted)]">{files.length>0 ? <span>File {idx+1} of {files.length}{current?`: ${current.name}`:''}</span> : <span>No files selected</span>}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={handleExtract} disabled={!current||busy}>{busy?'Reading…':'Extract text'}</button>
            {suggest && <button className="btn" onClick={applyAndNext}>Apply & add another</button>}
            {suggest && <button className="btn" onClick={applyAndDone}>Apply & done</button>}
            {files.length>0 && <button className="btn" onClick={skip} disabled={!hasMore && !suggest}>Skip</button>}
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          {suggest && (
            <div className="grid gap-2">
              <h4 className="text-base font-semibold mt-2">Suggested fields</h4>
              <div className="grid sm:grid-cols-2 gap-2">
                <div><label className="label">Name</label><input className="input" value={suggest.name||''} onChange={e=>setSuggest({...suggest!, name:e.target.value})} /></div>
                <div><label className="label">Dosage & Freq</label><input className="input" value={suggest.dose||''} onChange={e=>setSuggest({...suggest!, dose:e.target.value})} /></div>
                <div><label className="label">Start</label><input className="input" value={suggest.start||''} onChange={e=>setSuggest({...suggest!, start:e.target.value})} /></div>
                <div><label className="label">Stop</label><input className="input" value={suggest.stop||''} onChange={e=>setSuggest({...suggest!, stop:e.target.value})} /></div>
                <div><label className="label">Purpose</label><input className="input" value={suggest.purpose||''} onChange={e=>setSuggest({...suggest!, purpose:e.target.value})} /></div>
                <div><label className="label">Response</label><input className="input" value={suggest.response||''} onChange={e=>setSuggest({...suggest!, response:e.target.value})} /></div>
                <div className="sm:col-span-2"><label className="label">Side Effects / Reason Stopped</label><input className="input" value={suggest.sidefx||''} onChange={e=>setSuggest({...suggest!, sidefx:e.target.value})} /></div>
              </div>
              {raw && (
                <details className="mt-2">
                  <summary className="cursor-pointer">Show extracted text</summary>
                  <pre className="text-xs whitespace-pre-wrap mt-2">{raw.slice(0,12000)}</pre>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
