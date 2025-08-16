'use client'
import { Clock} from 'lucide-react'

import { useLastSavedLabel } from '@/lib/store'
export default function LastSaved(){
  const label = useLastSavedLabel()
  return <span className="badge flex items-center"><Clock size={14} className="mr-1"/> Last saved: {label}</span>
}
