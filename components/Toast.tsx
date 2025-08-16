'use client'
import { createContext, useContext, useState, useCallback } from 'react'

type Toast = { id: number; msg: string }
const ToastCtx = createContext<{push:(msg:string)=>void}>({push:()=>{}})

export function ToastProvider({children}:{children:React.ReactNode}){
  const [items, setItems] = useState<Toast[]>([])
  const push = useCallback((msg:string)=>{
    const id = Date.now()
    setItems(list=>[...list, {id, msg}])
    setTimeout(()=>setItems(list=>list.filter(t=>t.id!==id)), 2500)
  },[])
  return (
    <ToastCtx.Provider value={{push}}>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-50" role="status" aria-live="polite">
        {items.map(t=>(
          <div key={t.id} className="card shadow-glow">
            <p className="text-sm">{t.msg}</p>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast(){ return useContext(ToastCtx) }
