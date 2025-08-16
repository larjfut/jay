'use client'
export default function StatusBadge({ok, label}:{ok:boolean; label:string}){
  const cls = ok ? 'badge badge-success' : 'badge badge-warn'
  return (
    <span className={cls}>
      {label}
    </span>
  )
}
