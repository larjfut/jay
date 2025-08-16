'use client'
import { useState, useRef, useEffect } from 'react'

export default function Tooltip({label, children}:{label:string; children:React.ReactNode}){
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement|null>(null)
  useEffect(()=>{
    function onDoc(e:MouseEvent){ if(ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('click', onDoc); return ()=>document.removeEventListener('click', onDoc)
  },[])
  return (
    <div className="relative inline-flex items-center" ref={ref}>
      <button aria-label="Help" className="ml-2 icon-btn" onClick={()=>setOpen(v=>!v)} onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)} onFocus={()=>setOpen(true)} onBlur={()=>setOpen(false)}>?</button>
      {open && (
        <div role="tooltip" className="absolute z-50 top-full mt-2 w-64 p-3 rounded-2xl bg-[color:var(--surface-2)] shadow-neu text-sm">
          {label}
        </div>
      )}
      {children}
    </div>
  )
}
