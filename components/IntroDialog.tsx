'use client'
import { useEffect, useState } from 'react'

export default function IntroDialog({id, title, bullets}:{id:string; title:string; bullets:string[]}){
  const [open, setOpen] = useState(false)
  useEffect(()=>{
    const seen = typeof window!=='undefined' && localStorage.getItem(`intro:${id}`)
    if(!seen) setOpen(true)
  },[id])
  if(!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40" role="dialog" aria-modal="true" aria-label={title}>
      <div className="card max-w-lg" tabIndex={-1}>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <ul className="list-disc ml-6 text-sm space-y-1">
          {bullets.map((b,i)=><li key={i}>{b}</li>)}
        </ul>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn" onClick={()=>{localStorage.setItem(`intro:${id}`,'1'); setOpen(false)}}>Got it</button>
          <button className="btn btn-primary" onClick={()=>{localStorage.setItem(`intro:${id}`,'1'); setOpen(false)}}>Let’s start</button>
        </div>
      </div>
    </div>
  )
}
