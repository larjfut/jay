
'use client'
import { create } from 'zustand'

export type TimelineRow = { date: string; event: string; severity?: string; duration?: string; notes?: string }
export type Narrative = {
  chiefConcern: string
  workupSummary: string
  impact: string
  familySnapshot: string
  goals: string
  timeline: TimelineRow[]
}

export type MedRow = { name?: string; dose?: string; start?: string; stop?: string; purpose?: string; response?: string; sidefx?: string }
export type FamilyRow = { relation: string; age?: string; conditions: string; dxAge?: string; notes?: string }
export type RecordsIndexRow = { category: string; filename?: string; dateRange?: string }
export type TestsIndexRow = { category: string; filename?: string; dateRange?: string }
export type Provider = { doctorName: string; specialty?: string; email?: string; dueDate?: string; status?: 'Not started'|'Requested'|'In progress'|'Received'; notes?: string }
export type CoverToc = {
  title?: string
  date?: string
  items: { section: string; title: string; filename?: string; pagesOrSize?: string }[]
  patientName?: string
  dob?: string
  datePrepared?: string
  contact?: string
}
export type Patient = { name: string; pronouns?: string; dob?: string }

export type PacketState = {
  patient: Patient
  narrative: Narrative
  medsCurrent: MedRow[]
  medsPast: MedRow[]
  family: FamilyRow[]
  recordsIndex: RecordsIndexRow[]
  testsIndex: TestsIndexRow[]
  provider: Provider
  coverToc: CoverToc
  privacy: { redacted: boolean }
  lastSavedAt?: string
  checklist: { [key:string]: boolean }
  set: <K extends keyof PacketState>(k: K, v: PacketState[K]) => void
}

const DEFAULT: PacketState = {
  patient: { name: 'Jay', pronouns: '' },
  narrative: { chiefConcern:'', workupSummary:'', impact:'', familySnapshot:'', goals:'', timeline:[] },
  medsCurrent: [],
  medsPast: [],
  family: [],
  recordsIndex: [
    { category:'Primary care notes' },
    { category:'Specialist notes' },
    { category:'Hospital/ER summaries' },
    { category:'Imaging reports' },
    { category:'Lab & genetic reports' },
    { category:'Functional tests' },
    { category:'Therapy & other' },
  ],
  testsIndex: [
    { category:'Laboratory panels' },
    { category:'Genetic reports' },
    { category:'Imaging reports' },
    { category:'Pathology' },
    { category:'Functional/Specialty' },
    { category:'Other' },
  ],
  provider: { doctorName:'', specialty:'', email:'', dueDate:'', status:'Not started', notes:'' },
  coverToc: {
    title: 'Baylor UDC Packet',
    date: new Date().toISOString().slice(0,10),
    items: [],
    patientName: '',
    dob: '',
    datePrepared: '',
    contact: '',
  },
  privacy: { redacted: false },
  lastSavedAt: new Date().toISOString(),
  checklist: {},
  set: () => {}
}

export const usePacket = create<PacketState>((set)=> ({
  ...DEFAULT,
  set: (k, v)=> set(()=> ({ [k]: v } as any))
}))

export function loadFromLocal(): Partial<PacketState> {
  try {
    const raw = localStorage.getItem('packet')
    if (!raw) return {}
    return JSON.parse(raw)
  } catch { return {} }
}

export function saveToLocal(_: any){
  try {
    const state = usePacket.getState()
    const { set, ...data } = state as any
    const now = new Date().toISOString()
    ;(data as any).lastSavedAt = now
    localStorage.setItem('packet', JSON.stringify(data))
  } catch {}
}


export function useDisplayName(){
  const name = usePacket(s=>s.patient.name)
  const red = usePacket(s=>s.privacy.redacted)
  return red ? 'Patient' : (name || 'Patient')
}

export function useLastSavedLabel(){
  const iso = usePacket(s=>s.lastSavedAt)
  if (!iso) return 'Not saved yet'
  const d = new Date(iso)
  const now = new Date()
  const ms = now.getTime() - d.getTime()
  const mins = Math.round(ms/60000)
  if (mins < 1) return 'Just now'
  if (mins === 1) return '1 min ago'
  if (mins < 60) return mins + ' min ago'
  const hrs = Math.round(mins/60)
  if (hrs === 1) return '1 hour ago'
  return hrs + ' hours ago'
}
