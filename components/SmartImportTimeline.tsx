'use client'
import { useEffect, useState } from 'react'
import { extractTextFromPDF, extractTextFromImage, parseTimelineEvents, type TimelineParsed } from '@/lib/extract'

export default function SmartImportTimeline({open, onClose, onApply}:{open:boolean; onClose:()=>void; onApply:(rows:TimelineParsed[])=>void}){
  const [files, setFiles] = useState<File[]>([])
  const [idx, setIdx] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>('')
  const [raw, setRaw] = useState<string>('')
  const [rows, setRows] = useState<TimelineParsed[]>([])

  useEffect(()=>{ if(!open){ setFiles([]); setIdx(0); setBusy(false); setError(''); setRaw(''); setRows([]) } },[open])
  if (!open) return null
  const current = files[idx]
  const hasMore = idx < files.length - 1

  async function handleExtract(){
    if(!current) return
    setBusy(true); setError(''); setRaw(''); setRows([])
    try{
      let text = ''
      if (current.type === 'application/pdf' || current.name.toLowerCase().endsWith('.pdf')) text = await extractTextFromPDF(current)
      else if (current.type.startsWith('image/')) text = await extractTextFromImage(current)
      else throw new Error('Please upload a PDF or an image file.')
      setRaw(text)
      setRows(parseTimelineEvents(text))
    }catch(e:any){ setError(e?.message || 'Could not read the file.') } finally { setBusy(false) }
  }

  function updateRow(i:number, key:keyof TimelineParsed, val:string){ const copy=[...rows]; (copy[i] as any)[key]=val; setRows(copy) }
  function applyAndNext(){ if(rows.length) onApply(rows); if(hasMore){ setIdx(i=>i+1); setRows([]); setRaw('') } else onClose() }
  function applyAndDone(){ if(rows.length) onApply(rows); onClose() }
  function skip(){ if(hasMore){ setIdx(i=>i+1); setRows([]); setRaw('') } else onClose() }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40" role="dialog" aria-modal="true" aria-label="Smart Import — Timeline">
      <div className="card max-w-3xl w-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Smart Import — Timeline</h3>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        <p className="text-xs text-[color:var(--muted)] mb-3">Processed locally. Edit dates and event text before applying.</p>

        <div className="grid gap-3">
          <div className="grid sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <input type="file" multiple accept="application/pdf,image/*" onChange={e=>{ const list = Array.from(e.target.files||[]); setFiles(list); setIdx(0); setRows([]); setRaw(''); setError('') }} />
            </div>
            <div className="text-sm text-[color:var(--muted)]">{files.length>0 ? <span>File {idx+1} of {files.length}{current?`: ${current.name}`:''}</span> : <span>No files selected</span>}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={handleExtract} disabled={!current || busy}>{busy?'Reading…':'Extract text'}</button>
            {!!rows.length && <button className="btn" onClick={applyAndNext}>Apply & add another</button>}
            {!!rows.length && <button className="btn" onClick={applyAndDone}>Apply & done</button>}
            {files.length>0 && <button className="btn" onClick={skip} disabled={!hasMore && !rows.length}>Skip</button>}
          </div>

          {!!rows.length && (
            <div className="overflow-auto">
              <table className="w-full text-sm border-collapse">
                <thead><tr>
                  <th className="p-2 border">Date (MM/YYYY)</th>
                  <th className="p-2 border">Event</th>
                  <th className="p-2 border">Severity</th>
                  <th className="p-2 border">Duration</th>
                  <th className="p-2 border">Notes</th>
                </tr></thead>
                <tbody>
                  {rows.map((r,i)=> (
                    <tr key={i}>
                      <td className="p-2 border"><input className="input" value={r.date||''} onChange={e=>updateRow(i,'date', e.target.value)} /></td>
                      <td className="p-2 border"><input className="input" value={r.event||''} onChange={e=>updateRow(i,'event', e.target.value)} /></td>
                      <td className="p-2 border"><input className="input" value={r.severity||''} onChange={e=>updateRow(i,'severity', e.target.value)} /></td>
                      <td className="p-2 border"><input className="input" value={r.duration||''} onChange={e=>updateRow(i,'duration', e.target.value)} /></td>
                      <td className="p-2 border"><input className="input" value={r.notes||''} onChange={e=>updateRow(i,'notes', e.target.value)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!!raw && (
            <details className="mt-2">
              <summary className="cursor-pointer">Show extracted text</summary>
              <pre className="text-xs whitespace-pre-wrap mt-2">{raw.slice(0, 16000)}</pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}
