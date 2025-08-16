'use client'
import { useEffect, useState } from 'react'
import { extractTextFromPDF, extractTextFromImage, parseTestReport } from '@/lib/extract'

type Row = { category:string; filename:string; dateRange:string }

export default function SmartImportDialog({open, onClose, onApply}:{open:boolean; onClose:()=>void; onApply:(row:Row)=>void}){
  const [files, setFiles] = useState<File[]>([])
  const [idx, setIdx] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>('')
  const [raw, setRaw] = useState<string>('')
  const [suggest, setSuggest] = useState<Row|null>(null)

  useEffect(()=>{
    if (!open) {
      // reset state when dialog closes
      setFiles([]); setIdx(0); setBusy(false); setError(''); setRaw(''); setSuggest(null)
    }
  }, [open])

  if (!open) return null

  const current = files[idx]
  const hasMore = idx < files.length - 1

  async function handleExtract(){
    if(!current) return
    setBusy(true); setError(''); setRaw(''); setSuggest(null)
    try{
      let text = ''
      if (current.type === 'application/pdf' || current.name.toLowerCase().endsWith('.pdf')) {
        text = await extractTextFromPDF(current)
      } else if (current.type.startsWith('image/')) {
        text = await extractTextFromImage(current)
      } else {
        throw new Error('Please upload a PDF or an image file.')
      }
      setRaw(text)
      const s = parseTestReport(text)
      setSuggest(s)
    }catch(e:any){
      setError(e?.message || 'Could not read the file.')
    }finally{
      setBusy(false)
    }
  }

  function applyAndNext(){
    if(suggest) onApply(suggest)
    // advance to next file or finish
    if (hasMore) {
      setIdx(i=>i+1)
      setSuggest(null); setRaw(''); setError(''); setBusy(false)
    } else {
      onClose()
    }
  }

  function applyAndDone(){
    if(suggest) onApply(suggest)
    onClose()
  }

  function skip(){
    if (hasMore) {
      setIdx(i=>i+1); setSuggest(null); setRaw(''); setError(''); setBusy(false)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40" role="dialog" aria-modal="true" aria-label="Smart Import">
      <div className="card max-w-2xl w-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Smart Import — Tests</h3>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        <p className="text-xs text-[color:var(--muted)] mb-3">Files are processed in your browser and not uploaded. You can review and edit before applying.</p>

        <div className="grid gap-3">
          <div className="grid sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <input
                type="file"
                accept="application/pdf,image/*"
                multiple
                onChange={e=>{ const list = Array.from(e.target.files||[]); setFiles(list); setIdx(0); setSuggest(null); setRaw(''); setError('') }}
              />
            </div>
            <div className="text-sm text-[color:var(--muted)]">
              {files.length>0 ? (
                <span>File {idx+1} of {files.length}{current?`: ${current.name}`:''}</span>
              ) : <span>No files selected</span>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={handleExtract} disabled={!current || busy}>{busy?'Reading…':'Extract text'}</button>
            {suggest && <button className="btn" onClick={applyAndNext}>Apply & add another</button>}
            {suggest && <button className="btn" onClick={applyAndDone}>Apply & done</button>}
            {files.length>0 && <button className="btn" onClick={skip} disabled={!hasMore && !suggest}>Skip</button>}
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          {suggest && (
            <div className="grid gap-2">
              <h4 className="text-base font-semibold mt-2">Suggested fields</h4>
              <div className="grid sm:grid-cols-3 gap-2">
                <div>
                  <label className="label">Category</label>
                  <input className="input" value={suggest.category} onChange={e=>setSuggest({...suggest!, category:e.target.value})} />
                </div>
                <div>
                  <label className="label">Date Range</label>
                  <input className="input" value={suggest.dateRange} onChange={e=>setSuggest({...suggest!, dateRange:e.target.value})} />
                </div>
                <div>
                  <label className="label">Filename</label>
                  <input className="input" value={suggest.filename} onChange={e=>setSuggest({...suggest!, filename:e.target.value})} />
                </div>
              </div>

              <details className="mt-2">
                <summary className="cursor-pointer">Show extracted text</summary>
                <pre className="text-xs whitespace-pre-wrap mt-2">{raw.slice(0, 12000)}</pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
