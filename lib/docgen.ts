
'use client'
import { PacketState } from '@/lib/store'

function titlePara(text:string){ return new Paragraph({ text, heading: HeadingLevel.TITLE }) }
function h2(text:string){ return new Paragraph({ text, heading: HeadingLevel.HEADING_2 }) }
function p(text:string){ return new Paragraph({ children: [new TextRun(text)] }) }

export async function buildCoverTocDoc(state: PacketState){
  const { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, WidthType } = await import('docx');
  const name = state.patient?.name || 'Patient'
  const doc = new Document({ sections: [{ children: [
    titlePara('Baylor UDC Packet'),
    p(`Patient: ${name}`),
    h2('Table of Contents'),
    p('1. Cover & TOC'),
    p('2. Narrative'),
    p('3. Provider Letter (separate)'),
    p('4. Symptom Timeline'),
    p('5. Medical Records Index'),
    p('6. Test Results Index'),
    p('7. Medication History'),
    p('8. Family History'),
  ]}]})
  return {
    doc,
    async createBlob(){ return await Packer.toBlob(doc) }
  }
}

export async function buildNarrativeDoc(state: PacketState){
  const { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, WidthType } = await import('docx');
  const n = state.narrative
  const doc = new Document({ sections: [{ children: [
    titlePara('Section 2 — Narrative'),
    h2('Chief concern'), p(n.chiefConcern || ''),
    h2('Prior workup'), p(n.workupSummary || ''),
    h2('Daily impact'), p(n.impact || ''),
    h2('Family snapshot'), p(n.familySnapshot || ''),
    h2('Goals'), p(n.goals || ''),
  ]}] })
  return { doc, async createBlob(){ return await Packer.toBlob(doc) } }
}

export async function buildTimelineDoc(state: PacketState){
  const { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, WidthType } = await import('docx');
  const rows = state.narrative.timeline || []
  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: ['Date','Event','Severity','Duration','Notes'].map(h=> new TableCell({ children:[p(h)] })) }),
      ...rows.map(r=> new TableRow({ children: [
        new TableCell({ children:[p(r.date||'')]}),
        new TableCell({ children:[p(r.event||'')]}),
        new TableCell({ children:[p(r.severity||'')]}),
        new TableCell({ children:[p(r.duration||'')]}),
        new TableCell({ children:[p(r.notes||'')]}),
      ] }))
    ]
  })
  const doc = new Document({ sections: [{ children: [ titlePara('Section 4 — Symptom Timeline'), table ] }] })
  return { doc, async createBlob(){ return await Packer.toBlob(doc) } }
}

export async function buildMedsDoc(state: PacketState){
  const { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, WidthType } = await import('docx');
  const head = new TableRow({ children: ['Name','Dosage & Freq','Start','Stop','Purpose','Response','Side effects'].map(h=> new TableCell({ children:[p(h)] })) })
  const mkRows = (rows:any[]) => rows.map(r=> new TableRow({ children: [
    new TableCell({ children:[p(r.name||'')]}),
    new TableCell({ children:[p(r.dose||'')]}),
    new TableCell({ children:[p(r.start||'')]}),
    new TableCell({ children:[p(r.stop||'')]}),
    new TableCell({ children:[p(r.purpose||'')]}),
    new TableCell({ children:[p(r.response||'')]}),
    new TableCell({ children:[p(r.sidefx||'')]}),
  ] }))
  const doc = new Document({ sections: [{ children: [
    titlePara('Section 7 — Medications'),
    h2('Current'), new Table({ width:{size:100, type:WidthType.PERCENTAGE}, rows: [head, ...mkRows(state.medsCurrent||[])] }),
    h2('Past'), new Table({ width:{size:100, type:WidthType.PERCENTAGE}, rows: [head, ...mkRows(state.medsPast||[])] }),
  ]}]})
  return { doc, async createBlob(){ return await Packer.toBlob(doc) } }
}

export async function buildFamilyDoc(state: PacketState){
  const { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, WidthType } = await import('docx');
  const head = new TableRow({ children: ['Relation','Age/Age at death','Conditions','Age at dx','Notes'].map(h=> new TableCell({ children:[p(h)] })) })
  const rows = (state.family||[]).map(r=> new TableRow({ children: [
    new TableCell({ children:[p(r.relation||'')]}),
    new TableCell({ children:[p(r.age||'')]}),
    new TableCell({ children:[p(r.conditions||'')]}),
    new TableCell({ children:[p(r.dxAge||'')]}),
    new TableCell({ children:[p(r.notes||'')]}),
  ] }))
  const doc = new Document({ sections: [{ children: [ titlePara('Section 8 — Family History'), new Table({ width:{size:100, type:WidthType.PERCENTAGE}, rows: [head, ...rows] }) ] }]})
  return { doc, async createBlob(){ return await Packer.toBlob(doc) } }
}

export async function buildRecordsCoverDoc(state: PacketState){
  const { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, WidthType } = await import('docx');
  const rows = state.recordsIndex||[]
  const head = new TableRow({ children: ['#','Filename','Category','Date range'].map(h=> new TableCell({ children:[p(h)] })) })
  const body = rows.map((r, i)=> new TableRow({ children: [
    new TableCell({ children:[p(String(i+1))]}),
    new TableCell({ children:[p(r.filename||'')]}),
    new TableCell({ children:[p(r.category||'')]}),
    new TableCell({ children:[p(r.dateRange||'')]}),
  ] }))
  const doc = new Document({ sections: [{ children: [ titlePara('Section 5 — Medical Records Index Cover'), new Table({ width:{size:100, type:WidthType.PERCENTAGE}, rows:[head, ...body] }) ] }]})
  return { doc, async createBlob(){ return await Packer.toBlob(doc) } }
}

export async function buildTestsCoverDoc(state: PacketState){
  const { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, WidthType } = await import('docx');
  const rows = state.testsIndex||[]
  const head = new TableRow({ children: ['#','Filename','Category','Date range'].map(h=> new TableCell({ children:[p(h)] })) })
  const body = rows.map((r, i)=> new TableRow({ children: [
    new TableCell({ children:[p(String(i+1))]}),
    new TableCell({ children:[p(r.filename||'')]}),
    new TableCell({ children:[p(r.category||'')]}),
    new TableCell({ children:[p(r.dateRange||'')]}),
  ] }))
  const doc = new Document({ sections: [{ children: [ titlePara('Section 6 — Test Results Index Cover'), new Table({ width:{size:100, type:WidthType.PERCENTAGE}, rows:[head, ...body] }) ] }]})
  return { doc, async createBlob(){ return await Packer.toBlob(doc) } }
}

// Legacy export helpers kept for existing buttons (they trigger downloads directly)
export async function generateCoverTocDoc(state: PacketState){ const b = await buildCoverTocDoc(state).createBlob(); dl(b, '1_Cover_TOC.docx') }
export async function generateNarrativeDoc(state: PacketState){ const b = await buildNarrativeDoc(state).createBlob(); dl(b, '2_Narrative.docx') }
export async function generateTimelineDoc(state: PacketState){ const b = await buildTimelineDoc(state).createBlob(); dl(b, '4_Timeline.docx') }
export async function generateMedsDoc(state: PacketState){ const b = await buildMedsDoc(state).createBlob(); dl(b, '7_Medications.docx') }
export async function generateFamilyDoc(state: PacketState){ const b = await buildFamilyDoc(state).createBlob(); dl(b, '8_Family_History.docx') }
export async function generateRecordsCoverDoc(state: PacketState){ const b = await buildRecordsCoverDoc(state).createBlob(); dl(b, '5_Records_Index_Cover.docx') }
export async function generateTestsCoverDoc(state: PacketState){ const b = await buildTestsCoverDoc(state).createBlob(); dl(b, '6_Tests_Index_Cover.docx') }

function dl(blob: Blob, name: string){
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(()=>URL.revokeObjectURL(a.href), 1000)
}
