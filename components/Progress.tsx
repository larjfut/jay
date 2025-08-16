'use client'
import { useMemo } from 'react'
import { usePacket } from '@/lib/store'

export default function Progress() {
  const { narrative, medsCurrent, family } = usePacket()
  const pct = useMemo(()=>{
    let done = 0, total = 3
    if (narrative?.chiefConcern) done++
    if ((medsCurrent||[]).length) done++
    if ((family||[]).length) done++
    return Math.round((done/total)*100)
  }, [narrative, medsCurrent, family])
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Progress</h2>
        <span className="badge">{pct}%</span>
      </div>
      <div className="progress-wrap mt-3">
        <div className="progress-bar" style={{width: pct+'%'}} />
      </div>
      <p className="text-sm text-gray-600 mt-2">Complete the wizard to generate documents for Sections 2, 7, and 8. Section 3 must be written by a provider.</p>
    </div>
  )
}
