'use client'
import type { MedRow } from '@/lib/store'

export async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  // @ts-ignore
  const workerSrc = await import('pdfjs-dist/build/pdf.worker.min.mjs')
  // @ts-ignore
  pdfjs.GlobalWorkerOptions.workerSrc = (workerSrc as any).default || workerSrc
  const arrayBuf = await file.arrayBuffer()
  const loadingTask = pdfjs.getDocument({ data: arrayBuf })
  const pdf = await loadingTask.promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map((it:any)=> it.str).join(' ')
    text += '\n' + pageText
  }
  return text
}

export async function extractTextFromImage(file: File): Promise<string> {
  const Tesseract = await import('tesseract.js')
  const url = URL.createObjectURL(file)
  try{
    const res = await (Tesseract as any).recognize(url, 'eng')
    return res.data?.text || ''
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function parseTestReport(text: string): { category: string; dateRange: string; filename: string } {
  const lower = text.toLowerCase()
  function has(words: string[]) { return words.some(w => lower.includes(w.toLowerCase())) }
  let category = 'Other'
  if (has(['mri','ct','x-ray','xray','radiograph','ultrasound','echo','echocardiogram'])) category = 'Imaging reports'
  else if (has(['cbc','complete blood count','cmp','comprehensive metabolic','panel','lab','hemoglobin','hematocrit','platelet','wbc','creatinine','ast','alt'])) category = 'Laboratory panels'
  else if (has(['exome','whole exome','wes','wgs','gene','variant','pathogenic','likely pathogenic'])) category = 'Genetic reports'
  else if (has(['biopsy','pathology','histology','slides'])) category = 'Pathology'
  else if (has(['emg','eeg','tilt table','pulmonary function','pft','sleep study','echocardiogram','ekg','ecg'])) category = 'Functional/Specialty'

  const md = Array.from(text.matchAll(/\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})\b/g))
  const monYear = Array.from(text.matchAll(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+(\d{4})\b/gi))
  const toMonth = (m:string)=>({jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,sept:9,oct:10,nov:11,dec:12}[m.slice(0,3).toLowerCase()]||1)

  const dates: Date[] = []
  md.forEach((m:any)=>{
    const a = parseInt(m[1],10), b = parseInt(m[2],10), y = parseInt(m[3],10)
    const mm = (a<=12) ? a : b
    const dd = (mm===a) ? b : a
    const yyyy = y<100? (2000+y) : y
    dates.push(new Date(yyyy, mm-1, dd))
  })
  monYear.forEach((m:any)=>{
    const mm = toMonth(m[1])
    const yyyy = parseInt(m[2],10)
    dates.push(new Date(yyyy, mm-1, 1))
  })
  dates.sort((a,b)=>a.getTime()-b.getTime())
  let dateRange = ''
  const fmt = (d:Date)=> String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear()
  if (dates.length===1) dateRange = fmt(dates[0])
  else if (dates.length>1) dateRange = fmt(dates[0]) + '–' + fmt(dates[dates.length-1])

  const firstKey = (lower.match(/(mri|ct|cbc|cmp|emg|eeg|wes|wgs|biopsy|pathology|echo|ultrasound)/) || ['report'])[0]
  const rangeSlug = dateRange ? dateRange.replace(/[\/]/g,'-') : 'undated'
  const fname = `6.${category.replace(/\W+/g,'_')}_${firstKey}_${rangeSlug}.pdf`
  return { category, dateRange, filename: fname }
}

// -------- Timeline (Section 4) --------
export type TimelineParsed = { date: string; event: string; severity?: string; duration?: string; notes?: string }
export function parseTimelineEvents(text: string): TimelineParsed[] {
  const lines = text.replace(/\r/g,'').split(/\n+/).map(l=>l.trim()).filter(Boolean)
  const dateRe1 = /(\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b)/
  const dateRe2 = /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{4}\b)/i
  const out: TimelineParsed[] = []
  function mmYYYY(s:string){
    const m1 = s.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/)
    if (m1) {
      const a = parseInt(m1[1],10), b = parseInt(m1[2],10), y = parseInt(m1[3],10)
      const mm = (a<=12)?a:b
      const yyyy = y<100? (2000+y):y
      return String(mm).padStart(2,'0') + '/' + yyyy
    }
    const m2 = s.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i)
    if (m2){
      const mm = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,sept:9,oct:10,nov:11,dec:12}[m2[1].slice(0,3).toLowerCase()]||1
      return String(mm).padStart(2,'0') + '/' + m2[2]
    }
    return ''
  }
  for (let i=0;i<lines.length;i++){
    const l = lines[i]
    const d1 = l.match(dateRe1)
    const d2 = l.match(dateRe2)
    if (d1 || d2){
      const dateTok = d1 ? d1[1] : d2![0]
      const date = mmYYYY(dateTok) || dateTok
      let ev = l.replace(dateTok,'').replace(/^[—:-]\s*/,'').trim()
      if (!ev && lines[i+1]) ev = lines[i+1].trim()
      const sev = (l.match(/mild|moderate|severe|worsen(ed|ing)?|improv(ed|ing)?/i)||[''])[0]
      out.push({ date, event: ev || 'Event', severity: sev || undefined })
    } else {
      if (/^(impression|assessment|plan)[:\s]/i.test(l)){
        const block = [l]
        let j=i+1
        while (j<lines.length && lines[j] && !dateRe1.test(lines[j]) && !dateRe2.test(lines[j]) && block.join(' ').length < 400){
          block.push(lines[j]); j++
        }
        out.push({ date: '', event: block.join(' ').slice(0,200) })
        i = j-1
      }
    }
  }
  const seen = new Set<string>()
  return out.filter(r=>{
    const key = (r.date||'') + '|' + r.event.slice(0,60)
    if (seen.has(key)) return false
    seen.add(key); return true
  }).slice(0, 50)
}

// -------- Medications (Section 7) --------
export function parseMedication(text: string): MedRow {
  const lines = text.replace(/\r/g, '').split(/\n+/).map(l => l.trim()).filter(Boolean)
  const first = lines[0] || ''

  let name = ''
  let dose = ''
  const doseMatch = first.match(/\b\d+[^\s]*\s*(?:mg|mcg|g|ml|units|tabs?|caps?|drops?|puffs?|%)[^\s]*/i)
  if (doseMatch) {
    const idx = first.toLowerCase().indexOf(doseMatch[0].toLowerCase())
    name = first.slice(0, idx).trim()
    dose = first.slice(idx).trim()
  } else {
    name = first.trim()
  }

  const dateMatches = Array.from(text.matchAll(/\b(\d{1,2})[\/\-](\d{2,4})\b/g))
  const fmt = (m: any) => {
    const mm = parseInt(m[1], 10)
    const yy = m[2]
    const yyyy = yy.length === 2 ? '20' + yy : yy
    return String(mm).padStart(2, '0') + '/' + yyyy
  }
  const start = dateMatches[0] ? fmt(dateMatches[0]) : ''
  const stop = dateMatches[1] ? fmt(dateMatches[1]) : ''

  const purposeMatch = text.match(/purpose[:\s]+([^\n]+)/i) || text.match(/for[:\s]+([^\n]+)/i)
  const responseMatch = text.match(/response[:\s]+([^\n]+)/i)
  const sidefxMatch = text.match(/side(?:[- ]?effects?|fx)[:\s]+([^\n]+)/i) || text.match(/reason stopped[:\s]+([^\n]+)/i)

  return {
    name,
    dose,
    start,
    stop,
    purpose: purposeMatch ? purposeMatch[1].trim() : undefined,
    response: responseMatch ? responseMatch[1].trim() : undefined,
    sidefx: sidefxMatch ? sidefxMatch[1].trim() : undefined
  }
}
