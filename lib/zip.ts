
'use client'
import { saveAs } from '@/lib/saveAs'
import { usePacket, PacketState } from '@/lib/store'
import { buildCoverTocDoc, buildNarrativeDoc, buildTimelineDoc, buildMedsDoc, buildFamilyDoc, buildRecordsCoverDoc, buildTestsCoverDoc } from '@/lib/docgen'

function blobFromDoc(doc: any, filename: string): Promise<[string, Blob]> {
  return new Promise((resolve)=>{
    doc.createBlob().then((blob: Blob)=> resolve([filename, blob]))
  })
}

export async function downloadAllZip(state?: PacketState){
  const JSZip = (await import('jszip')).default;
  const store = state ?? (usePacket.getState() as any)
  const pName = store.patient?.name || 'Patient'
  const zip = new JSZip()

  const docs = [
    [await buildCoverTocDoc(store), '1_Cover_TOC.docx'],
    [await buildNarrativeDoc(store), '2_Narrative.docx'],
    [await buildTimelineDoc(store), '4_Timeline.docx'],
    [await buildRecordsCoverDoc(store), '5_Records_Index_Cover.docx'],
    [await buildTestsCoverDoc(store), '6_Tests_Index_Cover.docx'],
    [await buildMedsDoc(store), '7_Medications.docx'],
    [await buildFamilyDoc(store), '8_Family_History.docx'],
  ]

  for (const [doc, name] of docs as any[]) {
    if (!doc) continue
    const file = await (doc as any).createBlob?.() || await (doc as any)
    if (file instanceof Blob) zip.file(name, file)
  }

  const manifest = {
    patient: store.patient, generatedAt: new Date().toISOString(),
    sections: ['Cover & TOC','Narrative','Timeline','Records Cover','Tests Cover','Medications','Family']
  }
  zip.file('manifest.json', JSON.stringify(manifest, null, 2))

  const blob = await zip.generateAsync({ type: 'blob' })
  const fname = `${pName.replace(/\W+/g,'_')}_Baylor_UDC_Packet.zip`
  saveAs(blob, fname)
}
