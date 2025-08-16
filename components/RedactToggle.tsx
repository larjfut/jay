'use client'
import { Eye, EyeOff} from 'lucide-react'

import { usePacket } from '@/lib/store'
export default function RedactToggle(){
  const red = usePacket(s=>s.privacy?.redacted)
  const set = usePacket(s=>s.set)
  const Icon = red ? EyeOff : Eye
  return (
    <button className="btn" onClick={()=>set('privacy',{ redacted: !red })} title={red ? 'Redacted preview is on' : 'Redacted preview is off'}>
      <Icon size={18} className="mr-2"/>{red ? 'Redacted preview' : 'Show names'}
    </button>
  )
}
