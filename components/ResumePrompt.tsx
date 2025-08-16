'use client'
import { useEffect, useState } from 'react'
import { loadFromLocal, usePacket } from '@/lib/store'

export default function ResumePrompt(){
  const [hasSave, setHasSave] = useState(false)
  const store = usePacket()

  useEffect(()=>{
    try {
      const raw = localStorage.getItem('packet')
      setHasSave(!!raw && raw.length > 2)
    } catch { setHasSave(false) }
  }, [])

  if (!hasSave) return null

  return (
    <div className="card mb-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Resume your saved draft?</p>
          <p className="text-xs text-gray-600">We found unsent answers saved in this browser. You can continue or discard.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={()=>{
            const s = loadFromLocal()
            Object.entries(s || {}).forEach(([k,v]) => (store as any).set(k as any, v as any))
          }}>Continue</button>
          <button className="btn" onClick={()=>{
            localStorage.removeItem('packet')
            setHasSave(false)
          }}>Discard</button>
        </div>
      </div>
    </div>
  )
}
