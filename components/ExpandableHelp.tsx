'use client'
import { useState } from 'react'

export default function ExpandableHelp({title, children}:{title:string; children:React.ReactNode}){
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-3">
      <button className="btn" onClick={()=>setOpen(v=>!v)} aria-expanded={open}>
        {open ? 'Hide examples' : `Need examples? ${title}`}
      </button>
      {open && (
        <div className="mt-3 card">
          <div className="prose prose-invert max-w-none text-sm">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}
