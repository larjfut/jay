'use client'
import { useEffect, useMemo, useState } from 'react'
import { usePacket, loadFromLocal, saveToLocal } from '@/lib/store'
import { generateNarrativeDoc, generateMedsDoc, generateFamilyDoc, generateTimelineDoc, generateRecordsCoverDoc, generateTestsCoverDoc, generateCoverTocDoc, generateProviderTrackerDoc } from '@/lib/docgen'
import TwoCol from '@/components/TwoCol'
import IntroDialog from '@/components/IntroDialog'
import Tooltip from '@/components/Tooltip'
import ExpandableHelp from '@/components/ExpandableHelp'
import InfoSidebar from '@/components/InfoSidebar'
import StatusBadge from '@/components/StatusBadge'
import SmartImportDialog from '@/components/SmartImportDialog'
import { useToast } from '@/components/Toast'
import { useDisplayName } from '@/lib/store'
import { downloadAllZip } from '@/lib/zip'
import { Archive} from 'lucide-react'

import { CalendarRange, ClipboardList, FileDown, FileSpreadsheet, FileText, FlaskConical, FolderOpenDot, FolderOutput, NotebookPen, Pill, TestTubes, Timeline as TimelineIcon, Users} from 'lucide-react'

export default function Wizard(){
  const displayName = useDisplayName()
  const pName = usePacket.getState().patient.name
  const store = usePacket()
  const [step, setStep] = useState(1)

  useEffect(()=>{
    const loaded = loadFromLocal()
    if (Object.keys(loaded || {}).length) {
      if (loaded.narrative) store.set('narrative', loaded.narrative as any)
      if (loaded.medsCurrent) store.set('medsCurrent', loaded.medsCurrent as any)
      if (loaded.medsPast) store.set('medsPast', loaded.medsPast as any)
      if (loaded.family) store.set('family', loaded.family as any)
      if (loaded.recordsIndex) store.set('recordsIndex', loaded.recordsIndex as any)
      if (loaded.testsIndex) store.set('testsIndex', loaded.testsIndex as any)
      if (loaded.provider) store.set('provider', loaded.provider as any)
      if (loaded.coverToc) store.set('coverToc', loaded.coverToc as any)
      if (loaded.checklist) store.set('checklist', loaded.checklist as any)
    }
  },[])

  const next = ()=> setStep(s => Math.min(7, s+1))
  const prev = ()=> setStep(s => Math.max(1, s-1))

  const titles = [
    'Section 2 — Narrative',
    'Section 7 — Medications',
    'Section 8 — Family History',
    'Section 4 — Symptom Timeline',
    '{displayName}’s Medical Records Index',
    '{displayName}’s Test Results Index',
    'Exports — Build Docs'
  ]

  return (
    <div className="card">
      {/* stepper */}
      <div className="mb-3 flex flex-wrap gap-2">
        {[NotebookPen, Pill, Users, TimelineIcon, FolderOpenDot, TestTubes, FileDown].map((Icon, i)=> (
          <button key={i} className={`icon-btn ${step===i+1?'ring-2 ring-[color:var(--cta-start)]':''}`} onClick={()=>setStep(i+1)}>
            <Icon size={24}/>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold">Wizard</h2>
        <span className="text-xs text-gray-600">Step {step} of 7 • {titles[step-1]}</span>
      </div>

      {step===1 && <TwoCol left={<NarrativeForm />} right={<NarrativeHelp />} />}
      {step===2 && <TwoCol left={<MedsForm />} right={<MedsHelp />} />}
      {step===3 && <TwoCol left={<FamilyForm />} right={<FamilyHelp />} />}
      {step===4 && <TwoCol left={<TimelineOnly />} right={<TimelineHelp />} />}
      {step===5 && <TwoCol left={<RecordsIndex />} right={<RecordsHelp />} />}
      {step===6 && <TwoCol left={<TestsIndex />} right={<TestsHelp />} />}
      {step===7 && <TwoCol left={<ExportPanel />} right={<ExportHelp />} />}

      
      {step===1 && <IntroDialog id="step1" title="{displayName}’s Narrative" bullets={[
        'Use plain words to tell {displayName}’s story',
        'Short is fine — we’ll keep it to one page',
        'You can pause and return later'
      ]} />}
      {step===2 && <IntroDialog id="step2" title="{displayName}’s Medications" bullets={[
        'List what Jay takes now and what was tried',
        'If dates are fuzzy, month/year is fine',
        'Side effects help Baylor understand the journey'
      ]} />}
      {step===3 && <IntroDialog id="step3" title="{displayName}’s Family History" bullets={[
        'Start with close family and add more if helpful',
        'Unknowns are okay to note',
        'Patterns can support clinical decisions'
      ]} />}
      {step===4 && <IntroDialog id="step4" title="{displayName}’s Symptom Timeline" bullets={[
        'Use month/year when you can',
        'Add big moments: onset, changes, ER visits',
        'We’ll export this as a table later'
      ]} />}
      {step===5 && <IntroDialog id="step5" title="{displayName}’s Records Index" bullets={[
        'List combined PDFs by category',
        'Match filenames to the index',
        'Keep copies of originals'
      ]} />}
      {step===6 && <IntroDialog id="step6" title="{displayName}’s Test Results Index" bullets={[
        'Include labs, imaging, genetics — reports only',
        'Normal results matter too',
        'Note if images (DICOM) are available'
      ]} />}
      {step===7 && <IntroDialog id="step7" title="Exports" bullets={[
        'Download section files for {displayName}’s packet',
        'Review for accuracy and names',
        'You can always come back to edit'
      ]} />}

      <div className="mt-4 flex justify-between">
        <button className="btn" onClick={prev} disabled={step===1}>Back</button>
        <button className="btn btn-primary" onClick={next} disabled={step===7}>Next</button>
      </div>
      </div>
    )
  }

function NarrativeHelp(){
  return (
    <InfoSidebar title="{displayName}’s Narrative — Instructions">
      <p><strong>Length:</strong> 1 page; 400–600 words; plain language.</p>
      <ul>
        <li>{displayName}’s chief concern (1–2 sentences)</li>
        <li>Prior workup summary (specialists, key tests, treatments tried)</li>
        <li>Daily impact for Jay (what changes day to day)</li>
        <li>Family history snapshot (relevant conditions)</li>
        <li>Goals for evaluation (diagnostic questions/decisions)</li>
      </ul>
      <p className="mt-2"><strong>Tips:</strong> Keep factual & chronological. Put details in attached records. Use MM/YYYY when you can.</p>
    </InfoSidebar>
  )
}

function MedsHelp(){
  return (
    <InfoSidebar title="{displayName}’s Medications — Instructions">
      <p><strong>Length:</strong> 1–3 pages; table format.</p>
      <ul>
        <li>Include prescriptions, OTC, and supplements.</li>
        <li>Current meds first, then past meds (with stop reason).</li>
        <li>Fields: name, dose & frequency, dates, purpose, response, side effects/reason stopped.</li>
      </ul>
      <p className="mt-2"><strong>Tip:</strong> Be precise with dates; use month/year if exact day is unknown.</p>
    </InfoSidebar>
  )
}

function FamilyHelp(){
  return (
    <InfoSidebar title="{displayName}’s Family History — Instructions">
      <p><strong>Length:</strong> 1–2 pages; table preferred.</p>
      <ul>
        <li>Immediate family first, then extended.</li>
        <li>Include age/age at death, diagnoses, age at diagnosis, notes.</li>
        <li>Summarize patterns or known genetic conditions.</li>
        <li>Note unknowns (adoption, estrangement).</li>
      </ul>
    </InfoSidebar>
  )
}

function TimelineHelp(){
  return (
    <InfoSidebar title="{displayName}’s Symptom Timeline — Instructions">
      <p><strong>Length:</strong> 1–2 pages; bullets or table.</p>
      <ul>
        <li>Use MM/YYYY; add severity, duration, and triggers if known.</li>
        <li>Include onset, key changes, hospitalizations, treatment turning points.</li>
        <li>Current baseline and flare pattern at the end.</li>
      </ul>
      <p className="mt-2"><strong>Optional:</strong> keep separate flare logs; reference in Section 6 if they relate to tests.</p>
    </InfoSidebar>
  )
}

function RecordsHelp(){
  return (
    <InfoSidebar title="{displayName}’s Medical Records">
      <p><strong>Include:</strong> PCP notes, specialist notes, hospital/ER summaries, imaging reports, labs & genetics, functional tests, therapy notes.</p>
      <p><strong>Format:</strong> PDFs; grouped by category; chronological; clear filenames matching index.</p>
      <ul>
        <li>Verify legibility; remove irrelevant pages.</li>
        <li>Cross-reference with Section 6 (tests) when helpful.</li>
      </ul>
    </InfoSidebar>
  )
}

function TestsHelp(){
  return (
    <InfoSidebar title="{displayName}’s Test Results">
      <p><strong>Include:</strong> Labs, genetics, imaging, pathology, functional/specialty, and other relevant reports.</p>
      <p><strong>Format:</strong> PDFs; grouped by category; chronological; keep original versions.</p>
      <ul>
        <li>Include normal results that rule out conditions.</li>
        <li>Note availability of DICOM or slides.</li>
      </ul>
    </InfoSidebar>
  )
}

function ExportHelp(){
  return (
    <InfoSidebar title="Export {displayName}’s Packet">
      <ul>
        <li>Export DOCX for each section and review for accuracy.</li>
        <li>Ensure filenames match your indices.</li>
        <li>Mark items complete in the Dashboard checklist.</li>
      </ul>
      <p className="mt-2 text-xs text-gray-600">Provider letter (Section 3) must be authored by a clinician. Use the Tracker to record status.</p>
    </InfoSidebar>
  )
}

function NarrativeForm(){
  const store = usePacket()
  const { narrative, set } = store
  const [data, setData] = useState(narrative)

  const wordCount = useMemo(()=>{
    const text = [data.chiefConcern, data.workupSummary, data.impact, data.familySnapshot, data.goals].join(' ')
    return (text.trim().match(/\b\w+\b/g)||[]).length
  }, [data])

  const withinRange = wordCount >= 400 && wordCount <= 600
  const ready = withinRange && !!data.chiefConcern

  useEffect(()=>{ set('narrative', data); saveToLocal({} as any) }, [data])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <StatusBadge ok={ready} label={ready?'Ready':'Needs 400–600 words & Chief Concern'} />
        <span className="text-xs text-gray-600">Word count (Sections 2.1–2.6 combined): {wordCount} {withinRange?'✓':''}</span>
      </div>
      <Field label="Chief Concern" value={data.chiefConcern} onChange={v=>setData({...data, chiefConcern: v})}/>
      <Field label="Prior Workup Summary" value={data.workupSummary} onChange={v=>setData({...data, workupSummary: v})}/>
      <Field label="Daily Impact" value={data.impact} onChange={v=>setData({...data, impact: v})}/>
      <Field label="Family History Snapshot" value={data.familySnapshot} onChange={v=>setData({...data, familySnapshot: v})}/>
      <Field label="Goals for Evaluation" value={data.goals} onChange={v=>setData({...data, goals: v})}/>
      <div className="text-xs text-gray-500">The detailed timeline is collected in Step 4 and included in your narrative export.</div>
      <ExpandableHelp title="({displayName}’s Family History)">
        <p><strong>Example rows</strong></p>
        <ul>
          <li>Mother — hypothyroidism; dx age ~52; stable on levothyroxine</li>
          <li>Maternal uncle — type 1 diabetes; dx age 12</li>
          <li>Paternal grandfather — muscle weakness in later life; no diagnosis</li>
        </ul>
        <p><strong>Notes</strong>: Unknowns are okay. Say “not sure” or leave blank.</p>
      </ExpandableHelp>
      <div className="pt-2">
        <button className="btn btn-primary" onClick={()=>generateNarrativeDoc(store)} disabled={!ready}>Export Section 2 (DOCX)</button>
      </div>
      </div>
    )
  }

function TimelineOnly(){
  const store = usePacket()
  const [rows, setRows] = useState(store.narrative.timeline || [])
  const ready = rows.length > 0 && rows.every(r=>r.date && r.event)
  useEffect(()=>{ store.set('narrative', { ...store.narrative, timeline: rows }); saveToLocal({} as any) }, [rows])
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><div className="flex items-center gap-2"><h3 className="section-title flex items-center"><TimelineIcon size={22} className="mr-2"/> Symptom Timeline (MM/YYYY)</h3><Tooltip label="Month and year is enough. Add big moments and treatment changes."></Tooltip></div><Tooltip label="Month and year is enough. Add big moments and treatment changes."></Tooltip></div>
        <StatusBadge ok={ready} label={ready?'Ready':'Add at least 1 dated entry'} />
      </div>
      <TimelineEditor value={rows} onChange={setRows} />
      <div className="mt-2 flex gap-2">
        <button className="btn" onClick={()=>setRows([...rows, {date:'06/2018', event:'First noticed muscle weakness', severity:'Mild', duration:'Ongoing', notes:'After flu-like illness'}])}>Insert example row</button>
        <button className="btn btn-primary" onClick={()=>generateTimelineDoc(store)} disabled={!ready}>Export Section 4 (DOCX)</button>
        <button className="btn" onClick={()=>generateNarrativeDoc(store)} disabled={!ready}>Export Section 2 (Includes timeline)</button>
      </div>
      </div>
    )
  }

function MedsForm(){
  const store = usePacket()
  const [curr, setCurr] = useState(store.medsCurrent||[])
  const [past, setPast] = useState(store.medsPast||[])
  const ready = curr.length>0 || past.length>0
  useEffect(()=>{ store.set('medsCurrent', curr); store.set('medsPast', past); saveToLocal({} as any) }, [curr,past])
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><div className="flex items-center gap-2"><h3 className="section-title flex items-center"><Pill size={22} className="mr-2"/> Current Medications</h3><Tooltip label="Include prescriptions, OTC, and supplements."></Tooltip></div><Tooltip label="Include prescriptions, OTC, and supplements."></Tooltip></div>
        <StatusBadge ok={ready} label={ready?'Ready':'Add at least 1 medication'} />
      </div>
      <MedTable rows={curr} onChange={setCurr} current />
      <div className="flex gap-2">
        <button className="btn" onClick={()=>setCurr([...curr,{name:'Gabapentin', dose:'300 mg 3x daily', start:'05/2023', purpose:'Neuropathic pain', response:'Some improvement', sidefx:'Drowsiness'}])}>Insert example row</button>
      </div>
      <div className="flex items-center gap-2"><div className="flex items-center gap-2"><h3 className="section-title flex items-center"><Pill size={22} className="mr-2"/> Past Medications</h3><Tooltip label="Why it was stopped helps the team read patterns."></Tooltip></div><Tooltip label="Why it was stopped helps the team read patterns."></Tooltip></div>
      <MedTable rows={past} onChange={setPast} />
      <div className="flex gap-2">
        <button className="btn" onClick={()=>setPast([...past,{name:'Metoprolol', dose:'25 mg daily', start:'01/2022', stop:'03/2022', purpose:'Tremor', response:'Worsened fatigue', sidefx:'Stopped due to side effects'}])}>Insert example row</button>
      </div>
      <ExpandableHelp title="({displayName}’s Family History)">
        <p><strong>Example rows</strong></p>
        <ul>
          <li>Mother — hypothyroidism; dx age ~52; stable on levothyroxine</li>
          <li>Maternal uncle — type 1 diabetes; dx age 12</li>
          <li>Paternal grandfather — muscle weakness in later life; no diagnosis</li>
        </ul>
        <p><strong>Notes</strong>: Unknowns are okay. Say “not sure” or leave blank.</p>
      </ExpandableHelp>
      <div className="pt-2">
        <button className="btn btn-primary" onClick={()=>generateMedsDoc(store)} disabled={!ready}>Export Section 7 (DOCX)</button>
      </div>
      </div>
    )
  }

function FamilyForm(){
  const store = usePacket()
  const [rows, setRows] = useState(store.family||[])
  const ready = rows.length>0 && rows.every(r=>r.relation && r.conditions)
  useEffect(()=>{ store.set('family', rows); saveToLocal({} as any) }, [rows])
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="section-title flex items-center"><Users size={22} className="mr-2"/> Family History</h3>
        <StatusBadge ok={ready} label={ready?'Ready':'Add at least 1 relative + condition'} />
      </div>
      <table className="w-full border text-sm">
        <thead><tr className="bg-gray-50">
          <th className="p-2 border">Relation</th>
          <th className="p-2 border">Age / Age at Death</th>
          <th className="p-2 border">Conditions</th>
          <th className="p-2 border">Age at Dx</th>
          <th className="p-2 border">Notes</th>
          <th className="p-2 border"></th>
        </tr></thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i}>
              <td className="p-2 border"><input className="input" value={r.relation} onChange={e=>upd(i,{...r, relation:e.target.value})}/></td>
              <td className="p-2 border"><input className="input" value={r.age||''} onChange={e=>upd(i,{...r, age:e.target.value})}/></td>
              <td className="p-2 border"><input className="input" value={r.conditions} onChange={e=>upd(i,{...r, conditions:e.target.value})}/></td>
              <td className="p-2 border"><input className="input" value={r.dxAge||''} onChange={e=>upd(i,{...r, dxAge:e.target.value})}/></td>
              <td className="p-2 border"><input className="input" value={r.notes||''} onChange={e=>upd(i,{...r, notes:e.target.value})}/></td>
              <td className="p-2 border"><button className="btn" onClick={()=>setRows(rows.filter((_,k)=>k!==i))}>Remove</button></td>
            </tr>
          ))}
          <tr>
            <td colSpan={6} className="p-2">
              <button className="btn" onClick={()=>setRows([...rows,{relation:'Mother',age:'62',conditions:'Hypothyroidism',dxAge:'52',notes:'Stable on treatment'}])}>Insert example row</button>
              <button className="btn ml-2" onClick={()=>setRows([...rows,{relation:'',age:'',conditions:''}])}>Add empty row</button>
            </td>
          </tr>
        </tbody>
      </table>
      <ExpandableHelp title="({displayName}’s Family History)">
        <p><strong>Example rows</strong></p>
        <ul>
          <li>Mother — hypothyroidism; dx age ~52; stable on levothyroxine</li>
          <li>Maternal uncle — type 1 diabetes; dx age 12</li>
          <li>Paternal grandfather — muscle weakness in later life; no diagnosis</li>
        </ul>
        <p><strong>Notes</strong>: Unknowns are okay. Say “not sure” or leave blank.</p>
      </ExpandableHelp>
      <div className="pt-2">
        <button className="btn btn-primary" onClick={()=>generateFamilyDoc(store)} disabled={!ready}>Export Section 8 (DOCX)</button>
      </div>
      </div>
    )
    function upd(i:number, row:any){ setRows(rows.map((r,k)=>k===i?row:r)) }
  }

  function RecordsIndex(){
    const store = usePacket()
    const [rows, setRows] = useState(store.recordsIndex||[])
    const [open, setOpen] = useState(false)
    const ready = rows.every(r=>r.filename && r.dateRange)
    useEffect(()=>{ store.set('recordsIndex', rows); saveToLocal({} as any) }, [rows])
    function onApplyImport(r:{category:string; filename:string; dateRange:string}){
      setRows([...rows, { category: r.category, filename: r.filename, dateRange: r.dateRange }])
    }
    return (
      <div>
      <div className="flex items-center justify-between">
        <h3 className="section-title">Medical Records Index</h3>
        <StatusBadge ok={ready} label={ready?'Ready':'Add filename + date range for all rows'} />
      </div>
      <table className="w-full border text-sm">
        <thead><tr className="bg-gray-50">
          <th className="p-2 border">File #</th>
          <th className="p-2 border">Filename</th>
          <th className="p-2 border">Contents Description</th>
          <th className="p-2 border">Date Range</th>
        </tr></thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i}>
              <td className="p-2 border">{i+1}</td>
              <td className="p-2 border"><input className="input" placeholder="e.g., 5.2_Neurology_Notes_2019-2025.pdf" value={r.filename||''} onChange={e=>upd(i,{...r, filename:e.target.value})}/></td>
              <td className="p-2 border">{r.category}</td>
              <td className="p-2 border"><input className="input" placeholder="MM/YYYY–MM/YYYY" value={r.dateRange||''} onChange={e=>upd(i,{...r, dateRange:e.target.value})}/></td>
            </tr>
          ))}
        </tbody>
      </table>
        <div className="pt-2 flex gap-2">
          <button className="btn" onClick={()=>setOpen(true)}>Smart Import (PDFs/images)</button>
          <button className="btn" onClick={()=>setRows(rows.map((r,i)=>({...r, filename: r.filename||`${5}.${i+1}_${r.category.replace(/\W+/g,'_')}.pdf`})))}>Autofill filenames</button>
          <button className="btn btn-primary" onClick={()=>generateRecordsCoverDoc(store)} disabled={!ready}>Export Section 5 Cover (DOCX)</button>
        </div>
        <SmartImportDialog open={open} onClose={()=>setOpen(false)} onApply={onApplyImport} />
      </div>
    )
    function upd(i:number, row:any){ setRows(rows.map((r,k)=>k===i?row:r)) }
  }

function TestsIndex(){
  const store = usePacket()
  const [rows, setRows] = useState(store.testsIndex||[])
  const [open, setOpen] = useState(false)
  const ready = rows.every(r=>r.filename && r.dateRange)
  useEffect(()=>{ store.set('testsIndex', rows); saveToLocal({} as any) }, [rows])
  function onApplyImport(r:{category:string; filename:string; dateRange:string}){
    setRows([...rows, { category: r.category, filename: r.filename, dateRange: r.dateRange }])
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="section-title">Test Results Index</h3>
        <StatusBadge ok={ready} label={ready?'Ready':'Add filename + date range for all rows'} />
      </div>
      <table className="w-full border text-sm">
        <thead><tr className="bg-gray-50">
          <th className="p-2 border">File #</th>
          <th className="p-2 border">Filename</th>
          <th className="p-2 border">Contents Description</th>
          <th className="p-2 border">Date Range</th>
        </tr></thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i}>
              <td className="p-2 border">{i+1}</td>
              <td className="p-2 border"><input className="input" placeholder="e.g., 6.3_MRI_Brain_Reports_2019-2024.pdf" value={r.filename||''} onChange={e=>upd(i,{...r, filename:e.target.value})}/></td>
              <td className="p-2 border">{r.category}</td>
              <td className="p-2 border"><input className="input" placeholder="MM/YYYY–MM/YYYY" value={r.dateRange||''} onChange={e=>upd(i,{...r, dateRange:e.target.value})}/></td>
            </tr>
          ))}
        </tbody>
      </table>
        <div className="pt-2 flex gap-2">
          <button className="btn" onClick={()=>setOpen(true)}>Smart Import (PDFs/images)</button>
          <button className="btn" onClick={()=>setRows(rows.map((r,i)=>({...r, filename: r.filename||`${6}.${i+1}_${r.category.replace(/\W+/g,'_')}.pdf`})))}>Autofill filenames</button>
          <button className="btn btn-primary" onClick={()=>generateTestsCoverDoc(store)} disabled={!ready}>Export Section 6 Cover (DOCX)</button>
        </div>
        <SmartImportDialog open={open} onClose={()=>setOpen(false)} onApply={onApplyImport} />
      </div>
    )
    function upd(i:number, row:any){ setRows(rows.map((r,k)=>k===i?row:r)) }
  }

function ExportPanel(){
  const { push } = useToast()
  const red = usePacket(s=>s.privacy.redacted)
  const store = usePacket()
  const narrativeReady = !!store.narrative.chiefConcern && (()=>{
    const text = [store.narrative.chiefConcern, store.narrative.workupSummary, store.narrative.impact, store.narrative.familySnapshot, store.narrative.goals].join(' ')
    const wc = (text.trim().match(/\b\w+\b/g)||[]).length
    return wc>=400 && wc<=600
  })()
  const timelineReady = (store.narrative.timeline||[]).length>0
  const medsReady = (store.medsCurrent||[]).length>0 || (store.medsPast||[]).length>0
  const familyReady = (store.family||[]).length>0 && (store.family||[]).every((r:any)=>r.relation && r.conditions)
  const recordsReady = (store.recordsIndex||[]).every((r:any)=>r.filename && r.dateRange)
  const testsReady = (store.testsIndex||[]).every((r:any)=>r.filename && r.dateRange)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <StatusBadge ok={narrativeReady} label={`Section 2 ${narrativeReady?'Ready':'Incomplete'}`} />
        <StatusBadge ok={timelineReady} label={`Section 4 ${timelineReady?'Ready':'Incomplete'}`} />
        <StatusBadge ok={recordsReady} label={`Section 5 ${recordsReady?'Ready':'Incomplete'}`} />
        <StatusBadge ok={testsReady} label={`Section 6 ${testsReady?'Ready':'Incomplete'}`} />
        <StatusBadge ok={medsReady} label={`Section 7 ${medsReady?'Ready':'Incomplete'}`} />
        <StatusBadge ok={familyReady} label={`Section 8 ${familyReady?'Ready':'Incomplete'}`} />
      </div>
      {red && <p className="text-xs text-[color:var(--muted)]">Redacted preview is ON. Exports will include the full patient name.</p>}
      <p className="text-sm text-gray-700">Export completed sections as DOCX. Upload to Consultagene. Section 3 provider letter must be written by a clinician; you can export a tracker summary here.</p>
      <div className="flex gap-2 flex-wrap">
        <button className="btn btn-primary" onClick={()=>generateCoverTocDoc(store)}><FileSpreadsheet size={18} className="mr-2"/>Export Section 1/9 — Cover & TOC</button>
        <button className="btn btn-primary" onClick={()=>generateProviderTrackerDoc(store)}><ClipboardList size={18} className="mr-2"/>Export Section 3 — Provider Tracker</button>
        <button className="btn btn-primary" onClick={()=>generateNarrativeDoc(store)} disabled={!narrativeReady}><FileText size={18} className="mr-2"/>Export Section 2 — Narrative</button>
        <button className="btn btn-primary" onClick={()=>generateTimelineDoc(store)} disabled={!timelineReady}><CalendarRange size={18} className="mr-2"/>Export Section 4 — Timeline</button>
        <button className="btn btn-primary" onClick={()=>generateRecordsCoverDoc(store)} disabled={!recordsReady}><FolderOutput size={18} className="mr-2"/>Export Section 5 — Records Cover</button>
        <button className="btn btn-primary" onClick={()=>generateTestsCoverDoc(store)} disabled={!testsReady}><FlaskConical size={18} className="mr-2"/>Export Section 6 — Tests Cover</button>
        <button className="btn btn-primary" onClick={()=>generateMedsDoc(store)} disabled={!medsReady}><Pill size={18} className="mr-2"/>Export Section 7 — Medications</button>
        <button className="btn btn-primary" onClick={()=>generateFamilyDoc(store)} disabled={!familyReady}><Users size={18} className="mr-2"/>Export Section 8 — Family</button>
      </div>
      </div>
    )
  }

function Field({label, value, onChange}:{label:string; value:string; onChange:(v:string)=>void}){
  return (
    <div>
      <label className="label">{label}</label>
      
      <details className="mt-2">
        <summary className="cursor-pointer text-sm text-[color:var(--muted)] hover:underline">Need examples?</summary>
        <div className="mt-1 text-sm space-y-1">
          <p>Example for {displayName}’s Narrative: “Jay has had ongoing joint pain since 2018, starting in the knees and now affecting shoulders and wrists. Fatigue has worsened over time and limits daily activities.”</p>
          <p>Example for {displayName}’s Family History: “Mother — hypothyroidism, diagnosed age 40. Maternal grandmother — arthritis, onset in 50s. Brother — no known conditions.”</p>
        </div>
      </details>
    
      <textarea className="input" rows={4} value={value} onChange={e=>onChange(e.target.value)} />
    </div>
  )
}

function TimelineEditor({value, onChange}:{value:any[]; onChange:(v:any[])=>void}){
  const rows = value || []
  return (
    <div>
      <table className="w-full border text-sm">
        <thead><tr className="bg-gray-50">
          <th className="p-2 border">Date</th>
          <th className="p-2 border">Symptom/Event</th>
          <th className="p-2 border">Severity</th>
          <th className="p-2 border">Duration</th>
          <th className="p-2 border">Notes</th>
          <th className="p-2 border"></th>
        </tr></thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i}>
              <td className="p-2 border"><input className="input" placeholder="MM/YYYY" value={r.date} onChange={e=>upd(i,{...r,date:e.target.value})}/></td>
              <td className="p-2 border"><input className="input" value={r.event} onChange={e=>upd(i,{...r,event:e.target.value})}/></td>
              <td className="p-2 border"><input className="input" value={r.severity||''} onChange={e=>upd(i,{...r,severity:e.target.value})}/></td>
              <td className="p-2 border"><input className="input" value={r.duration||''} onChange={e=>upd(i,{...r,duration:e.target.value})}/></td>
              <td className="p-2 border"><input className="input" value={r.notes||''} onChange={e=>upd(i,{...r,notes:e.target.value})}/></td>
              <td className="p-2 border"><button className="btn" onClick={()=>onChange(rows.filter((_,k)=>k!==i))}>Remove</button></td>
            </tr>
          ))}
          <tr>
            <td colSpan={6} className="p-2">
              <button className="btn" onClick={()=>onChange([...rows,{date:'',event:''}])}>Add row</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
  function upd(i:number, row:any){ onChange(rows.map((r,k)=>k===i?row:r)) }
}

function MedTable({rows, onChange, current=false}:{rows:any[]; onChange:(v:any[])=>void; current?:boolean}){
  function upd(i:number, row:any){ onChange(rows.map((r,k)=>k===i?row:r)) }
  return (
    <table className="w-full border text-sm">
      <thead><tr className="bg-gray-50">
        <th className="p-2 border">Name</th>
        <th className="p-2 border">Dosage & Freq</th>
        <th className="p-2 border">Start</th>
        {!current && <th className="p-2 border">Stop</th>}
        <th className="p-2 border">Purpose</th>
        <th className="p-2 border">Response</th>
        <th className="p-2 border">{current?'Side Effects':'Reason Stopped'}</th>
        <th className="p-2 border"></th>
      </tr></thead>
      <tbody>
        {rows.map((r,i)=>(
          <tr key={i}>
            <td className="p-2 border"><input className="input" value={r.name||''} onChange={e=>upd(i,{...r,name:e.target.value})}/></td>
            <td className="p-2 border"><input className="input" value={r.dose||''} onChange={e=>upd(i,{...r,dose:e.target.value})}/></td>
            <td className="p-2 border"><input className="input" placeholder="MM/YYYY" value={r.start||''} onChange={e=>upd(i,{...r,start:e.target.value})}/></td>
            {!current && <td className="p-2 border"><input className="input" placeholder="MM/YYYY" value={r.stop||''} onChange={e=>upd(i,{...r,stop:e.target.value})}/></td>}
            <td className="p-2 border"><input className="input" value={r.purpose||''} onChange={e=>upd(i,{...r,purpose:e.target.value})}/></td>
            <td className="p-2 border"><input className="input" value={r.response||''} onChange={e=>upd(i,{...r,response:e.target.value})}/></td>
            <td className="p-2 border"><input className="input" value={r.sidefx||''} onChange={e=>upd(i,{...r,sidefx:e.target.value})}/></td>
            <td className="p-2 border"><button className="btn" onClick={()=>onChange(rows.filter((_,k)=>k!==i))}>Remove</button></td>
          </tr>
        ))}
        <tr>
          <td colSpan={8} className="p-2">
            <button className="btn" onClick={()=>onChange([...rows,{}])}>Add row</button>
          </td>
        </tr>
      </tbody>
    </table>
  )
}
